import { type NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import { amountMatches, isWithinCaptureWindow } from "@/lib/payment-capture";
import {
  MYMONEY_CONFIGURED,
  searchTransactionByUtr,
  findCreditByAmount,
  registerStorefrontWebhook,
} from "@/lib/mymoney";

export const runtime = "nodejs";

/**
 * Auto-captures a Direct UPI order. Designed so the customer NEVER has to type
 * a UTR — payment is confirmed automatically the moment the credit lands:
 *
 *   1. (optional) the UTR exists in the gateway (the credit actually arrived)
 *   2. the received amount matches the order's unique padded billed amount
 *   3. the credit arrived within 15 minutes of the order being placed
 *
 * Matching strategy (in priority order):
 *   - If a UTR is supplied, look that exact credit up.
 *   - Otherwise (the normal auto-capture case) scan recent gateway credits and
 *     match the one whose amount equals this order's billedAmount. Because each
 *     order has a distinct padded amount, an exact amount match identifies the
 *     order unambiguously — no UTR required.
 *
 * The gateway's own `verified` flag is NOT required; padded amount + timing is
 * the authoritative match.
 *
 * Order is identified by `orderId` (preferred) or by `utr`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const utr = (body?.utr || "").toString().trim();
    const orderId = (body?.orderId || "").toString().trim();

    if (!orderId && utr.length < 6) {
      return apiError("Order ID or UTR is required", 400);
    }

    if (!MYMONEY_CONFIGURED) {
      // myMoney not configured — cannot auto-capture.
      return apiSuccess({ found: false, captured: false });
    }

    // Make sure late credits keep getting pushed to us via webhook.
    registerStorefrontWebhook().catch(() => {});

    await connectToDatabase();
    const orderQuery: any = {
      paymentMethod: "directupi",
      utrStatus: { $ne: "verified" },
    };
    if (orderId) orderQuery._id = orderId;
    else orderQuery.utr = utr;

    const order = await StorefrontOrder.findOne(orderQuery);
    if (!order) {
      return apiSuccess({ found: false, captured: false, reason: "no_matching_order" });
    }

    // Find the matching credit: prefer the exact UTR, else match by amount.
    const txn = utr
      ? await searchTransactionByUtr(utr)
      : await findCreditByAmount(order.billedAmount);

    if (!txn) {
      // Gateway has not yet recorded the credit (SMS not received / not matched).
      return apiSuccess({
        found: false,
        captured: false,
        reason: "not_yet_received",
        autoCapture: true,
      });
    }

    const gatewayStatus = (txn.status || "").toString().toLowerCase();
    const gatewayAmount = Number(txn.amount) || 0;
    const transactionDate = txn.transactionDate;

    const baseResult = {
      found: true,
      status: gatewayStatus,
      amount: gatewayAmount,
      billedAmount: order.billedAmount,
      utr: txn.utr,
      transactionDate,
      captured: false as boolean,
      reason: "" as string,
      autoCapture: true,
    };

    // Rule 1: exact amount match against the padded billed amount.
    if (!amountMatches(order.billedAmount, gatewayAmount)) {
      order.utrStatus = "rejected";
      order.utrFailureReason = "amount_mismatch";
      await order.save();
      return apiSuccess({
        ...baseResult,
        reason: "amount_mismatch",
      });
    }

    // Rule 2: credit must arrive within 15 minutes of order creation.
    if (!isWithinCaptureWindow(order.createdAt, transactionDate ? new Date(transactionDate) : undefined)) {
      order.utrStatus = "rejected";
      order.utrFailureReason = "outside_window";
      await order.save();
      return apiSuccess({
        ...baseResult,
        reason: "outside_window",
      });
    }

    // All rules passed → automatic capture (amount + time + UTR all match).
    order.utr = String(txn.utr || utr);
    order.utrStatus = "verified";
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.paidAt = transactionDate ? new Date(transactionDate) : new Date();
    await order.save();

    return apiSuccess({
      ...baseResult,
      captured: true,
      paymentStatus: "paid",
      orderStatus: "confirmed",
      gatewayVerified: gatewayStatus === "verified",
    });
  } catch {
    // Network error or timeout — silently degrade.
    return apiSuccess({ found: false, captured: false });
  }
}
