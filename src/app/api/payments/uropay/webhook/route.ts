import { type NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import { getGateway } from "@/lib/payment-gateways";

export const runtime = "nodejs";

// UroPay webhook. Must be registered in the UroPay dashboard as:
//   <site>/api/payments/uropay/webhook
// Fires multiple times per order — handler is idempotent.
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-uropay-signature") ||
      request.headers.get("x-signature") ||
      request.headers.get("signature");

    const gateway = await getGateway("uropay");

    if (!gateway.verifyWebhook(rawBody, signature)) {
      return apiError("Invalid webhook signature", 401);
    }

    const payload = JSON.parse(rawBody);
    const merchantOrderId = payload.merchantOrderId;
    if (!merchantOrderId) return apiSuccess({ received: true });

    await connectToDatabase();
    const order = await StorefrontOrder.findOne({ orderNumber: merchantOrderId });
    if (!order) return apiSuccess({ received: true });

    const event = payload.event;
    const orderStatus = payload.orderStatus;

    if (event === "companion.sms.data" || orderStatus === "COMPLETED") {
      order.paymentStatus = "paid";
      if (order.status === "pending" || order.status === "confirmed") {
        order.status = "confirmed";
      }
      order.uroPayStatus = "COMPLETED";
    } else if (orderStatus === "REVIEW_REQUIRED") {
      order.uroPayStatus = "REVIEW_REQUIRED";
    } else {
      order.uroPayStatus = orderStatus || event || order.uroPayStatus;
    }

    await order.save();

    return apiSuccess({ received: true });
  } catch (error) {
    return apiError("Webhook processing failed", 500);
  }
}
