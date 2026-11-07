import { NextRequest, NextResponse } from "next/server";
import { getAppById } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const app = getAppById(id);

    if (!app) {
      return NextResponse.json(
        { success: false, error: "App not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      app,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch app details" },
      { status: 500 }
    );
  }
}
