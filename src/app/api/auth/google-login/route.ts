import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { buildAuthResponse } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontUser } from "@/lib/storefront-models/User";

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return apiError("Google token is required");
    }

    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );

    if (!googleResponse.ok) {
      return apiError("Invalid Google token", 401);
    }

    const tokenInfo = (await googleResponse.json()) as GoogleTokenInfo;
    const email = tokenInfo.email?.trim().toLowerCase();

    if (!email || tokenInfo.email_verified !== "true") {
      return apiError("Google account email is not verified", 401);
    }

    const expectedAudience = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (expectedAudience && tokenInfo.aud !== expectedAudience) {
      return apiError("Google token audience mismatch", 401);
    }

    const user =
      (await StorefrontUser.findOneAndUpdate(
        { email },
        {
          $set: {
            name: tokenInfo.name?.trim() || email.split("@")[0],
            image: tokenInfo.picture || "",
            isActive: true,
          },
          $setOnInsert: {
            role: "customer",
          },
        },
        {
          new: true,
          upsert: true,
        }
      )) || null;

    if (!user) {
      return apiError("Failed to authenticate with Google", 500);
    }

    return apiSuccess(buildAuthResponse(user));
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to login with Google"), 500);
  }
}
