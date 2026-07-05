import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCategories } from "@/lib/catalog-storefront";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const response = await getCategories(request.nextUrl.searchParams.get("isActive"));
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load categories",
      },
      { status: 500 }
    );
  }
}

