import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import { getGateway } from "@/lib/payment-gateways";

export const runtime = "nodejs";

// Submits the customer-provided UTR / reference number to UroPay.
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
    if (!order || !order.uroPayOrderId) {
      return apiError("UroPay order not found", 404);
    }

    const gateway = await getGateway("uropay");
    const data = await gateway.submitReference(order.uroPayOrderId, reference);

    order.uroPayStatus = data?.orderStatus || "UTR_SUBMITTED";
    await order.save();

    return apiSuccess(data);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to submit reference"), 500);
  }
}
