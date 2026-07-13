import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getHeroSlideById } from "@/lib/catalog-storefront";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const heroSlide = await getHeroSlideById(id);

    if (!heroSlide) {
      return NextResponse.json(
        { success: false, error: "Hero slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: heroSlide });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load hero slide",
      },
      { status: 500 }
    );
  }
}
