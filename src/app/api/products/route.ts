import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getProducts } from "@/lib/catalog-storefront";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const response = await getProducts({
      brand: searchParams.get("brand") || undefined,
      category: searchParams.get("category") || undefined,
      isFeatured: searchParams.get("isFeatured"),
      limit: searchParams.get("limit"),
      maxPrice: searchParams.get("maxPrice"),
      minPrice: searchParams.get("minPrice"),
      page: searchParams.get("page"),
      productType: searchParams.get("productType") || undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort"),
      status: searchParams.get("status") || undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load products",
      },
      { status: 500 }
    );
  }
}

