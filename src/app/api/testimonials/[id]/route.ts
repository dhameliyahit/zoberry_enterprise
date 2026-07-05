import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontTestimonial } from "@/lib/storefront-models/Testimonial";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const testimonial = await StorefrontTestimonial.findById(id).lean();

    if (!testimonial) {
      return apiError("Testimonial not found", 404);
    }

    return apiSuccess(testimonial);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load testimonial"), 500);
  }
}
