import { NextRequest, NextResponse } from "next/server";
import { getAppById, incrementDownload } from "@/lib/db";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";

const r2Client = (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME)
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

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

    // If app.apkUrl is a full external URL (e.g. GitHub releases or external CDN)
    if (app.apkUrl.startsWith("http://") || app.apkUrl.startsWith("https://")) {
      return NextResponse.redirect(app.apkUrl, { status: 302 });
    }

    // Extract object key from app.apkUrl (e.g. /api/storage/apks/1794051728249-base.apk -> apks/1794051728249-base.apk)
    let objectKey = app.apkUrl.replace(/^\/api\/storage\//, "").replace(/^\/uploads\//, "");
    if (!objectKey.startsWith("apks/")) {
      objectKey = `apks/${objectKey}`;
    }

    const filename = app.apkFileName.endsWith(".apk")
      ? app.apkFileName
      : `${app.name.toLowerCase().replace(/\s+/g, "_")}_${app.version}.apk`;

    // If R2 is configured, generate a fast presigned download URL with attachment header!
    if (r2Client) {
      try {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: objectKey,
          ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
          ResponseContentType: "application/vnd.android.package-archive",
        });

        const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 7200 }); // 2 hours
        return NextResponse.redirect(presignedUrl, { status: 302 });
      } catch (err) {
        console.error("Presigned download generation error:", err);
      }
    }

    // Fallback: direct storage path redirect
    return NextResponse.redirect(new URL(app.apkUrl, request.url), { status: 302 });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download APK" },
      { status: 500 }
    );
  }
}
