import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontHeroSlide } from "@/lib/storefront-models/HeroSlide";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const isActiveParam = request.nextUrl.searchParams.get("isActive");
    const filter =
      isActiveParam === null
        ? { isActive: true }
        : {
            isActive: isActiveParam === "true",
          };

    const heroSlides = await StorefrontHeroSlide.find(filter).sort({ order: 1 }).lean();

    return apiSuccess(heroSlides);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load hero slides"), 500);
  }
}
