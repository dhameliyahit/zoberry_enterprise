import { type NextRequest } from "next/server";
import mongoose from "mongoose";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontOrder } from "@/lib/storefront-models/Order";
import { StorefrontProduct } from "@/lib/storefront-models/Product";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();

  try {
    await connectToDatabase();
    const user = await requireAuthenticatedUser(request);
    const { id } = await context.params;

    session.startTransaction();

    const order = await StorefrontOrder.findOne({
      _id: id,
      customer: user._id,
    }).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return apiError("Only pending or confirmed orders can be cancelled", 400);
    }

    for (const item of order.items) {
      await StorefrontProduct.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    order.status = "cancelled";
    await order.save({ session });
    await session.commitTransaction();

    return apiSuccess(order);
  } catch (error) {
    await session.abortTransaction();
    const message = getErrorMessage(error, "Failed to cancel order");
    const status =
      message === "Authentication required" || message === "User not found" ? 401 : message === "Order not found" ? 404 : 500;
    return apiError(message, status);
  } finally {
    await session.endSession();
  }
}
