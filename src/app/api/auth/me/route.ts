import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser, sanitizeUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuthenticatedUser(request);
    return apiSuccess(sanitizeUser(user));
  } catch (error) {
    const message = getErrorMessage(error, "Failed to load profile");
    const status = message === "Authentication required" || message === "User not found" ? 401 : 500;
    return apiError(message, status);
  }
}
