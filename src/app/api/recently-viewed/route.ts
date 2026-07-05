import { type NextRequest } from "next/server";
import { apiError, apiSuccess, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontProduct } from "@/lib/storefront-models/Product";
import { StorefrontRecentlyViewed } from "@/lib/storefront-models/RecentlyViewed";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const macAddress = request.nextUrl.searchParams.get("macAddress")?.trim();

    if (!macAddress) {
      return apiError("macAddress is required");
    }

    const record = await StorefrontRecentlyViewed.findOne({ macAddress }).lean();

    if (!record?.productIds?.length) {
      return apiSuccess([]);
    }

    const products = await StorefrontProduct.find({
      _id: { $in: record.productIds },
      isActive: true,
    })
      .populate("category")
      .lean();

    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const sortedProducts = record.productIds
      .map((productId) => productMap.get(productId.toString()))
      .filter(Boolean);

    return apiSuccess(sortedProducts);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load recently viewed products"), 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const macAddress = typeof body.macAddress === "string" ? body.macAddress.trim() : "";
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";

    if (!macAddress || !productId) {
      return apiError("macAddress and productId are required");
    }

    const existing = await StorefrontRecentlyViewed.findOne({ macAddress });

    if (!existing) {
      await StorefrontRecentlyViewed.create({
        macAddress,
        productIds: [productId],
      });
      return apiSuccess(null, 201);
    }

    existing.productIds = existing.productIds.filter((id) => id.toString() !== productId);
    existing.productIds.unshift(productId as never);
    existing.productIds = existing.productIds.slice(0, 8);
    await existing.save();

    return apiSuccess(null);
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to update recently viewed products"), 500);
  }
}
