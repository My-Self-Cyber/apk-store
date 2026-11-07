import { NextRequest, NextResponse } from "next/server";
import { getAppById, incrementDownload, loadDbFromR2 } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await loadDbFromR2();
    const app = getAppById(id);

    if (!app) {
      return NextResponse.json(
        { success: false, error: "App not found" },
        { status: 404 }
      );
    }

    // Increment download count
    incrementDownload(id);

    // If app.apkUrl is a full external URL (e.g. GitHub releases or external CDN)
    if (app.apkUrl.startsWith("http://") || app.apkUrl.startsWith("https://")) {
      return NextResponse.redirect(app.apkUrl, { status: 302 });
    }

    // Extract object key from app.apkUrl (e.g. /api/storage/apks/1794051728249-base.apk -> apks/1794051728249-base.apk)
    let objectKey = app.apkUrl.replace(/^\/api\/storage\//, "").replace(/^\/uploads\//, "");
    if (!objectKey.startsWith("apks/")) {
      objectKey = `apks/${objectKey}`;
    }

    // Stream directly via the dedicated storage CDN route
    const storageUrl = new URL(`/api/storage/${objectKey}`, request.url);
    return NextResponse.redirect(storageUrl, { status: 302 });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download APK" },
      { status: 500 }
    );
  }
}
