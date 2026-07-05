import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuthenticatedUser(request);

    const orders = await StorefrontOrder.find({ customer: user._id }).sort({ createdAt: -1 });

    return apiSuccess(orders);
  } catch (error) {
    const message = getErrorMessage(error, "Failed to load orders");
    const status = message === "Authentication required" || message === "User not found" ? 401 : 500;
    return apiError(message, status);
  }
}
