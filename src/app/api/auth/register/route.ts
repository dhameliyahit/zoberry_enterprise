import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { buildAuthResponse, hashPassword } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontUser } from "@/lib/storefront-models/User";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || !email || !password) {
      return apiError("Name, email, and password are required");
    }

    if (password.length < 6) {
      return apiError("Password must be at least 6 characters");
    }

    const existingUser = await StorefrontUser.findOne({ email });

    if (existingUser) {
      return apiError("User already exists", 409);
    }

    const user = await StorefrontUser.create({
      name,
      email,
      password: await hashPassword(password),
      phone,
      role: "customer",
    });

    return apiSuccess(buildAuthResponse(user), 201);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to register user"), 500);
  }
}
