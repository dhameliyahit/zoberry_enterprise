import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import crypto from "crypto";
import {
  amountMatches,
  isWithinCaptureWindow,
} from "@/lib/payment-capture";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.MYMONEY_WEBHOOK_SECRET || "";

if (!WEBHOOK_SECRET) {
  // Fail loud in production so a misconfigured secret never silently accepts
  // unsigned payloads.
  if ((process.env.NODE_ENV || "development") === "production") {
    throw new Error("MYMONEY_WEBHOOK_SECRET is not set");
  }
}

// Next.js Route to receive verified callbacks from myMoney
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const timestamp = request.headers.get("X-MyMoney-Timestamp") || "";
    const signature = request.headers.get("X-MyMoney-Signature") || "";
    const eventType = request.headers.get("X-MyMoney-Event") || "";

    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Validate Signature: sha256(timestamp + "." + body, secret)
    const expectedMessage = timestamp + "." + rawBody;
    const computedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(expectedMessage)
      .digest("hex");

    if (computedSignature !== signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process transaction.verified AND transaction.pending events.
    // Primary capture rule = exact amount + within 10-min window; the gateway's
    // own `verified` flag is a bonus, not a prerequisite.
    if (eventType === "transaction.verified" || eventType === "transaction.pending") {
      const incoming = payload?.data?.transaction || payload?.data;
      const txn = incoming?.utr ? incoming : null;
      if (txn && txn.utr) {
        const utr = String(txn.utr).trim();
        const gatewayAmount = Number(txn.amount) || 0;

        // Find the order to capture. Prefer an explicit link (UTR or order
        // number), then fall back to the unique padded billed amount so a
        // payment can auto-capture with NO UTR entry — each order has a
        // distinct amount, so an exact match identifies it unambiguously.
        const order =
          (await StorefrontOrder.findOne({
            $or: [{ utr: utr }, { orderNumber: txn.orderId }],
            paymentMethod: "directupi",
            utrStatus: { $ne: "verified" },
          })) ||
          (gatewayAmount > 0
            ? await StorefrontOrder.findOne({
                billedAmount: gatewayAmount,
                paymentMethod: "directupi",
                utrStatus: { $ne: "verified" },
              })
            : null);

        if (order) {
          const amountOk = amountMatches(order.billedAmount, gatewayAmount);
          const windowOk = isWithinCaptureWindow(order.createdAt, txn.transactionDate);

          // A clearly wrong amount is rejected for review.
          if (!amountOk) {
            order.utrStatus = "rejected";
            order.utrFailureReason = "amount_mismatch";
            await order.save();
            return new Response(JSON.stringify({
              success: false,
              message: "Amount mismatch — capture rejected",
            }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Amount matches. Capture if within the window, else keep pending for a
          // later re-check (do not reject a late-but-correct payment).
          if (windowOk) {
            order.utr = utr;
            order.utrStatus = "verified";
            order.paymentStatus = "paid";
            order.status = "confirmed";
            order.paidAt = txn.transactionDate ? new Date(txn.transactionDate) : new Date();
            await order.save();
            return new Response(JSON.stringify({ success: true, message: "Order confirmed via webhook" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Event received but not matched to order" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Webhook error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
