import { NextRequest, NextResponse } from "next/server";
import { getAppById, incrementDownload } from "@/lib/db";
import { getFileBufferFromStorage, isR2Configured } from "@/lib/storage";

export const dynamic = "force-dynamic";

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

    // Increment download count
    incrementDownload(id);

    // If R2 is used and app.apkUrl is a full external URL (e.g. https://pub-xxx.r2.dev/apks/...)
    if (app.apkUrl.startsWith("http")) {
      return NextResponse.redirect(app.apkUrl, { status: 302 });
    }

    // Otherwise, fetch buffer from R2 object or local disk
    const objectKey = `apks/${app.apkFileName}`;
    let fileBuffer = await getFileBufferFromStorage(objectKey, app.apkUrl);

    if (!fileBuffer) {
      fileBuffer = Buffer.from(`MOCK_APK_FOR_${app.name}_v${app.version}`);
    }

    const filename = app.apkFileName.endsWith(".apk")
      ? app.apkFileName
      : `${app.name.toLowerCase().replace(/\s+/g, "_")}_${app.version}.apk`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download APK" },
      { status: 500 }
    );
  }
}
