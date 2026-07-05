import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ addressId: string }> }
) {
  try {
    await connectToDatabase();
    const user = await requireAuthenticatedUser(request);
    const { addressId } = await context.params;

    user.addresses.pull({ _id: addressId });
    await user.save();

    return apiSuccess(user.addresses);
  } catch (error) {
    const message = getErrorMessage(error, "Failed to delete address");
    const status = message === "Authentication required" || message === "User not found" ? 401 : 500;
    return apiError(message, status);
  }
}
