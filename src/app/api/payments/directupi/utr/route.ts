import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";

export const runtime = "nodejs";

// Stores the customer-provided UTR for a static Direct UPI order.
// Validation is manual: the merchant verifies the credit in their bank
// and flips paymentStatus -> paid from the admin panel.
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

    return apiSuccess({
      utrStatus: "submitted",
      message: "Reference submitted. Awaiting manual verification.",
    });
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to submit reference"), 500);
  }
}
