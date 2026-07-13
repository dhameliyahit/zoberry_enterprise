import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import crypto from "crypto";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.MYMONEY_WEBHOOK_SECRET || "8d11e65d87863387a419549121429113ce92332a429368c72324384a67eced42";

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

    // Only process transaction.verified events
    if (eventType === "transaction.verified") {
      const txn = payload.data;
      if (txn && txn.utr) {
        const utr = String(txn.utr).trim();
        // Find order by UTR or transaction ref
        const order = await StorefrontOrder.findOne({
          $or: [{ utr: utr }, { orderNumber: txn.orderId }],
          paymentMethod: "directupi"
        });

        if (order) {
          order.utr = utr;
          order.utrStatus = "verified";
          order.paymentStatus = "paid";
          order.status = "confirmed";
          await order.save();
          return new Response(JSON.stringify({ success: true, message: "Order confirmed via webhook" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
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
