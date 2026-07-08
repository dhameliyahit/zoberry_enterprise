import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontNewsletter } from "@/lib/storefront-models/Newsletter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return apiError("Email is required", 400);
    }

    // Basic regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Invalid email format", 400);
    }

    // Check if already subscribed
    const existing = await StorefrontNewsletter.findOne({ email });
    if (existing) {
      return apiError("Email is already subscribed to our newsletter", 400);
    }

    const subscription = await StorefrontNewsletter.create({ email });

    return apiSuccess({ message: "Successfully subscribed to newsletter!", subscription }, 201);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to subscribe to newsletter"), 500);
  }
}
