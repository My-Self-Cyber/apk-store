import { NextRequest, NextResponse } from "next/server";
import { getAllApps } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limitParam = searchParams.get("limit");

    let apps = getAllApps(category, search);

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        apps = apps.slice(0, limit);
      }
    }

    return NextResponse.json({
      success: true,
      total: apps.length,
      apps,
    });
  } catch (error: any) {
    console.error("API /api/apps error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
