import { NextRequest, NextResponse } from "next/server";
import { deleteApp, getAppById, updateApp } from "@/lib/db";
import { deleteFileFromStorage } from "@/lib/storage";

export async function DELETE(
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

    // Try deleting APK file from storage
    if (app.apkFileName) {
      await deleteFileFromStorage(`apks/${app.apkFileName}`);
    }

    const removed = deleteApp(id);

    return NextResponse.json({
      success: removed,
      message: "App removed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete app" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = updateApp(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "App not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      app: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update app" },
      { status: 500 }
    );
  }
}
