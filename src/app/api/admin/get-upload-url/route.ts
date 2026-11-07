import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || "";

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

export async function POST(request: NextRequest) {
  try {
    if (!r2Client) {
      return NextResponse.json(
        { success: false, error: "Cloudflare R2 storage is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileName, contentType, subFolder = "apks" } = body;

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "fileName is required" },
        { status: 400 }
      );
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const objectKey = `${subFolder}/${timestamp}-${cleanName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    const publicUrl = R2_PUBLIC_DOMAIN
      ? `${R2_PUBLIC_DOMAIN.replace(/\/$/, "")}/${objectKey}`
      : `/api/storage/${objectKey}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      objectKey,
    });
  } catch (error: any) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
