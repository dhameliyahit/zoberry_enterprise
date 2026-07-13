import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCategoryBySlug } from "@/lib/catalog-storefront";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();

    const { slug } = await context.params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load category",
      },
      { status: 500 }
    );
  }
}
