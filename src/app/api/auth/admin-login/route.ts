import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { buildAuthResponse, comparePassword } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontUser } from "@/lib/storefront-models/User";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return apiError("Email and password are required");
    }

    const user = await StorefrontUser.findOne({ email }).select("+password");

    if (!user?.password || !(await comparePassword(password, user.password))) {
      return apiError("Invalid credentials", 401);
    }

    if (user.role !== "admin") {
      return apiError("Admin access required", 403);
    }

    return apiSuccess(buildAuthResponse(user));
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to login"), 500);
  }
}
