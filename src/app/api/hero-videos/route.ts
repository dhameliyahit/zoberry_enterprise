import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontHeroVideo } from "@/lib/storefront-models/HeroVideo";
import "@/lib/storefront-models/Product";

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

    const heroVideos = await StorefrontHeroVideo.find(filter)
      .populate("product")
      .sort({ order: 1 })
      .lean();

    return apiSuccess(heroVideos);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load hero videos"), 500);
  }
}
