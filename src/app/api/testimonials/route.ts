import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontTestimonial } from "@/lib/storefront-models/Testimonial";

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

    const testimonials = await StorefrontTestimonial.find(filter).sort({ order: 1 }).lean();

    return apiSuccess(testimonials);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load testimonials"), 500);
  }
}
