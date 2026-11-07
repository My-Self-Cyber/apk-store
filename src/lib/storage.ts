import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 credentials from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || ""; // e.g., https://pub-xxxx.r2.dev or custom cdn domain

export function isR2Configured(): boolean {
  return Boolean(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME
  );
}

// Initialize S3 client for Cloudflare R2
const r2Client = isR2Configured()
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

export interface UploadResult {
  url: string;
  storageType: "r2" | "local";
  key: string;
}

/**
 * Upload a file either to Cloudflare R2 or local disk storage
 */
export async function uploadFileToStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  subFolder: "apks" | "images"
): Promise<UploadResult> {
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const objectKey = `${subFolder}/${cleanName}`;

  if (isR2Configured() && r2Client) {
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: objectKey,
          Body: buffer,
          ContentType: contentType,
        })
      );

      // Construct public URL
      const publicUrl = R2_PUBLIC_DOMAIN
        ? `${R2_PUBLIC_DOMAIN.replace(/\/$/, "")}/${objectKey}`
        : `/api/storage/${objectKey}`;

      return {
        url: publicUrl,
        storageType: "r2",
        key: objectKey,
      };
    } catch (err) {
      console.error("Cloudflare R2 upload error, falling back to local:", err);
    }
  }

  // Fallback: Local Storage
  const localDir = path.join(process.cwd(), "public", "uploads", subFolder);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const localFilePath = path.join(localDir, cleanName);
  fs.writeFileSync(localFilePath, buffer);

  return {
    url: `/uploads/${subFolder}/${cleanName}`,
    storageType: "local",
    key: objectKey,
  };
}

/**
 * Delete a file from Cloudflare R2 or local disk
 */
export async function deleteFileFromStorage(objectKey: string): Promise<boolean> {
  if (isR2Configured() && r2Client) {
    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: objectKey,
        })
      );
      return true;
    } catch (e) {
      console.warn("R2 delete error:", e);
    }
  }

  try {
    const localPath = path.join(process.cwd(), "public", "uploads", objectKey);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
  } catch (e) {
    console.warn("Local file delete error:", e);
  }

  return false;
}

/**
 * Retrieve file buffer for download streaming
 */
export async function getFileBufferFromStorage(
  objectKey: string,
  fallbackLocalPath?: string
): Promise<Buffer | null> {
  if (isR2Configured() && r2Client) {
    try {
      const response = await r2Client.send(
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: objectKey,
        })
      );
      if (response.Body) {
        const byteArray = await response.Body.transformToByteArray();
        return Buffer.from(byteArray);
      }
    } catch (e) {
      console.warn("R2 get file error, checking local fallback:", e);
    }
  }

  // Check local disk
  const pathsToCheck = [
    path.join(process.cwd(), "public", "uploads", objectKey),
    fallbackLocalPath ? path.join(process.cwd(), "public", fallbackLocalPath) : "",
  ].filter(Boolean);

  for (const p of pathsToCheck) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p);
    }
  }

  return null;
}
