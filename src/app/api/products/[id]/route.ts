import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getProductById } from "@/lib/catalog-storefront";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const product = await getProductById(id);

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

