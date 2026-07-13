import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getHeroSlides } from "@/lib/catalog-storefront";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const isActiveParam = request.nextUrl.searchParams.get("isActive");
    const response = await getHeroSlides(
      isActiveParam === null ? true : isActiveParam === "true"
    );

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load hero slides",
      },
      { status: 500 }
    );
  }
}
