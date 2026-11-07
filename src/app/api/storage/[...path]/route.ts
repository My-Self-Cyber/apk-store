import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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
  { params }: { params: { path: string[] } }
) {
  try {
    if (!r2Client) {
      return new NextResponse("Storage not configured", { status: 500 });
    }

    const key = (params.path || []).join("/");
    if (!key) {
      return new NextResponse("Key missing", { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return new NextResponse("File not found in storage", { status: 404 });
    }

    const filename = key.substring(key.lastIndexOf("/") + 1);
    const isApk = key.endsWith(".apk");

    const contentType = response.ContentType || (
      key.endsWith(".webp") ? "image/webp" :
      key.endsWith(".png") ? "image/png" :
      key.endsWith(".jpg") || key.endsWith(".jpeg") ? "image/jpeg" :
      isApk ? "application/vnd.android.package-archive" :
      "application/octet-stream"
    );

    const stream = response.Body.transformToWebStream();

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": isApk ? "public, max-age=3600" : "public, max-age=31536000, immutable",
      ...(response.ContentLength ? { "Content-Length": response.ContentLength.toString() } : {}),
    };

    if (isApk) {
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      return new NextResponse("File not found", { status: 404 });
    }
    console.error("Storage route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
