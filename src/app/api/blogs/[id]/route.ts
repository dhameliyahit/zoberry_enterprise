import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontBlog } from "@/lib/storefront-models/Blog";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const blog = await StorefrontBlog.findById(id).lean();

    if (!blog) {
      return apiError("Blog not found", 404);
    }

    return apiSuccess(blog);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load blog"), 500);
  }
}
