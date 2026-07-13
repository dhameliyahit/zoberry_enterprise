import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { requireAuthenticatedUser } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontProduct } from "@/lib/storefront-models/Product";
import { StorefrontCategory } from "@/lib/storefront-models/Category";
import { StorefrontReview } from "@/lib/storefront-models/Review";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // Authenticate the user
    const user = await requireAuthenticatedUser(request);
    const { id: productId } = await context.params;

    const body = await request.json();
    const rating = Number(body.rating);
    const comment = String(body.comment || "").trim();

    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      return apiError("Rating must be a number between 1 and 5", 400);
    }
    if (!comment) {
      return apiError("Comment is required", 400);
    }

    // Check product exists
    const product = await StorefrontProduct.findById(productId);
    if (!product) {
      return apiError("Product not found", 404);
    }

    // Upsert review (one review per user per product)
    await StorefrontReview.findOneAndUpdate(
      { product: productId, user: user._id },
      { rating, comment },
      { upsert: true, new: true, runValidators: true }
    );

    // Recalculate average rating
    const allReviews = await StorefrontReview.find({ product: productId });
    const count = allReviews.length;
    const average =
      count > 0
        ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
        : 0;

    product.ratings = { average, count };
    await product.save();

    // Return updated product with reviews populated
    void StorefrontCategory; // ensure Category model is registered for populate
    const updatedProduct = await StorefrontProduct.findById(productId)
      .populate("category", "name slug")
      .lean();

    const reviewDocs = await StorefrontReview.find({ product: productId })
      .populate("user", "name email")
      .lean();

    const reviews = reviewDocs.map((r: any) => ({
      name: r.user?.name ?? "Anonymous",
      email: r.user?.email ?? "",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    return apiSuccess({ ...updatedProduct, reviews });
  } catch (error) {
    console.error("ADD REVIEW ERROR:", error);
    return apiError(getErrorMessage(error, "Failed to submit review"), 500);
  }
}
