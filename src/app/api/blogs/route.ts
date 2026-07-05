import { NextResponse, type NextRequest } from "next/server";
import { apiError, getErrorMessage } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { StorefrontBlog } from "@/lib/storefront-models/Blog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category")?.trim();
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");
    const isActiveParam = searchParams.get("isActive");
    const isActive =
      isActiveParam === null ? true : isActiveParam === "true" ? true : isActiveParam === "false" ? false : true;

    const filter: Record<string, unknown> = { isActive };
    if (category) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      StorefrontBlog.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
      StorefrontBlog.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return apiError(getErrorMessage(error, "Failed to load blogs"), 500);
  }
}
