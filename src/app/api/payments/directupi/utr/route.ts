import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import {
  amountMatches,
  isWithinCaptureWindow,
} from "@/lib/payment-capture";

export const runtime = "nodejs";

const MYMONEY_API = process.env.MYMONEY_API_URL || "https://m2money.duckdns.org/api";
const MYMONEY_KEY = process.env.MYMONEY_PARTNER_KEY || "";

function parseMyMoneyResponse(data: any): any | null {
  const items: any[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data?.items)
    ? data.data.items
    : Array.isArray(data?.transactions)
    ? data.transactions
    : [];
  return items;
}

// Stores the customer-provided UTR for a static Direct UPI order and attempts an
// automatic capture against the myMoney gateway (UTR + exact amount + 10-min
// window). If the gateway has not yet recorded the credit, the order stays
// `submitted` and a later webhook / re-check performs the capture.
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuthenticatedUser(request);
    const { orderId, referenceNumber } = await request.json();

    const reference = (referenceNumber || "").trim();
    if (reference.length < 6) {
      return apiError("Please enter a valid UPI reference (UTR) number");
    }

    const order = await StorefrontOrder.findOne({ _id: orderId, customer: user._id });
    if (!order) return apiError("Order not found", 404);
    if (order.paymentMethod !== "directupi") {
      return apiError("This order does not use Direct UPI payment", 400);
    }

    order.utr = reference;
    order.utrStatus = "submitted";
    await order.save();

    // Attempt auto-capture if the gateway has already recorded the credit.
    if (MYMONEY_KEY) {
      try {
        const res = await fetch(`${MYMONEY_API}/partner/transactions/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": MYMONEY_KEY,
          },
          body: JSON.stringify({ utr: reference }),
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = await res.json();
          const items = parseMyMoneyResponse(data);
          const txn = items.find(
            (t) => String(t?.utr || "").trim() === reference
          );

          if (txn) {
            const gatewayAmount = Number(txn.amount) || 0;
            const windowOk = isWithinCaptureWindow(
              order.createdAt,
              txn.transactionDate
            );

            // Primary capture rule: exact amount + within window.
            if (amountMatches(order.billedAmount, gatewayAmount) && windowOk) {
              order.utrStatus = "verified";
              order.paymentStatus = "paid";
              order.status = "confirmed";
              order.paidAt = txn.transactionDate ? new Date(txn.transactionDate) : new Date();
              await order.save();

              return apiSuccess({
                utrStatus: "verified",
                paymentStatus: "paid",
                orderStatus: "confirmed",
                captured: true,
                message: "Payment matched and captured automatically.",
              });
            }

            if (!amountMatches(order.billedAmount, gatewayAmount)) {
              return apiSuccess({
                utrStatus: "submitted",
                captured: false,
                reason: "amount_mismatch",
                message:
                  "The amount credited did not match the exact billed amount. Please check and contact support.",
              });
            }

            if (!windowOk) {
              return apiSuccess({
                utrStatus: "submitted",
                captured: false,
                reason: "outside_window",
                message: "Payment received outside the 10-minute capture window.",
              });
            }
          }
        }
      } catch {
        // Gateway unreachable — keep order as submitted for later capture.
      }
    }

    return apiSuccess({
      utrStatus: "submitted",
      captured: false,
      message: "Reference submitted. We'll verify the credit and confirm your order.",
    });
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to submit reference"), 500);
  }
}
