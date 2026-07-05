import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getProductBySlug } from "@/lib/catalog-storefront";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();

    const { slug } = await context.params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load product",
      },
      { status: 500 }
    );
  }
}

