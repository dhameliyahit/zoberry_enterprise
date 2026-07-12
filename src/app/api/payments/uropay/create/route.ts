import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import { getGateway } from "@/lib/payment-gateways";
import { getPaymentConfig } from "@/lib/payment-config";

export const runtime = "nodejs";

function buildUpiDeepLink(config: any, amount: number, merchantOrderId: string, note?: string): string {
  const provider = config.providers?.uropay || {};
  return `upi://pay?pa=${encodeURIComponent(provider.vpa || "")}&pn=${encodeURIComponent(provider.vpaName || "Zoberry")}&am=${amount}&tn=${encodeURIComponent(note || `Order ${merchantOrderId}`)}&tr=${encodeURIComponent(merchantOrderId)}&cu=INR`;
}

// Creates a UroPay order (QR) for an existing storefront order.
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuthenticatedUser(request);
    const { orderId } = await request.json();

    const order = await StorefrontOrder.findOne({ _id: orderId, customer: user._id });
    if (!order) return apiError("Order not found", 404);
    if (order.paymentMethod !== "uropay") {
      return apiError("Order is not a UroPay order", 400);
    }

    const config = await getPaymentConfig(false);

    if (order.uroPayOrderId) {
      return apiSuccess({
        uroPayOrderId: order.uroPayOrderId,
        amount: order.total,
        alreadyCreated: true,
        deepLink: buildUpiDeepLink(config, order.total, order.orderNumber),
      });
    }

    const gateway = await getGateway("uropay");
    const result = await gateway.createPayment({
      merchantOrderId: order.orderNumber,
      amount: order.total,
      customerName: order.shippingAddress?.fullName || user.name || "Customer",
      customerEmail: user.email,
    });

    order.uroPayOrderId = result.gatewayOrderId;
    order.uroPayStatus = "CREATED";
    await order.save();

    return apiSuccess({
      uroPayOrderId: result.gatewayOrderId,
      qr: result.qr,
      deepLink: result.deepLink || buildUpiDeepLink(config, order.total, order.orderNumber),
      amount: order.total,
    });
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to initialise UPI payment"), 500);
  }
}
