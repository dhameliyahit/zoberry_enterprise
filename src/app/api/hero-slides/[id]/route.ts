import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontHeroSlide } from "@/lib/storefront-models/HeroSlide";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const heroSlide = await StorefrontHeroSlide.findById(id).lean();

    if (!heroSlide) {
      return apiError("Hero slide not found", 404);
    }

    return apiSuccess(heroSlide);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load hero slide"), 500);
  }
}
