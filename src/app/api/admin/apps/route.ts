import { NextRequest, NextResponse } from "next/server";
import { addApp, formatBytes } from "@/lib/db";
import { uploadFileToStorage } from "@/lib/storage";
import { AppItem } from "@/types/app";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const packageName = (formData.get("packageName") as string) || `com.app.${Date.now()}`;
    const version = (formData.get("version") as string) || "1.0.0";
    const category = (formData.get("category") as string) || "Tools";
    const developer = (formData.get("developer") as string) || "Independent Developer";
    const shortDescription = (formData.get("shortDescription") as string) || "";
    const description = (formData.get("description") as string) || "";
    const minAndroidVersion = (formData.get("minAndroidVersion") as string) || "Android 8.0+";
    const changelog = (formData.get("changelog") as string) || "Initial release";

    const apkFile = formData.get("apkFile") as File | null;
    const iconFile = formData.get("iconFile") as File | null;
    const iconUrlInput = formData.get("iconUrl") as string | null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "App name is required" },
        { status: 400 }
      );
    }

    if (!apkFile || typeof apkFile === "string") {
      return NextResponse.json(
        { success: false, error: "Valid .APK file is required" },
        { status: 400 }
      );
    }

    // Generate safe clean slug ID
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const id = `${slug}-${Date.now().toString(36)}`;

    // Upload APK File to Cloudflare R2 or Local Storage
    const safeApkName = `${slug}-${version.replace(/[^a-zA-Z0-9.-]/g, "_")}-${Date.now()}.apk`;
    const apkBuffer = Buffer.from(await apkFile.arrayBuffer());
    const fileSize = apkBuffer.length;
    const fileSizeFormatted = formatBytes(fileSize);

    const apkUpload = await uploadFileToStorage(
      apkBuffer,
      safeApkName,
      "application/vnd.android.package-archive",
      "apks"
    );

    // Upload Icon File if provided
    let iconUrl = iconUrlInput || "/sample-icons/default-app.svg";
    if (iconFile && typeof iconFile !== "string" && iconFile.size > 0) {
      const ext = iconFile.name.substring(iconFile.name.lastIndexOf(".")) || ".png";
      const iconFileName = `icon-${id}${ext}`;
      const iconBuffer = Buffer.from(await iconFile.arrayBuffer());
      const iconUpload = await uploadFileToStorage(
        iconBuffer,
        iconFileName,
        iconFile.type || "image/png",
        "images"
      );
      iconUrl = iconUpload.url;
    }

    // Upload Screenshots
    const screenshots: string[] = [];
    const screenshotFiles = formData.getAll("screenshotFiles") as (File | string)[];

    for (let i = 0; i < screenshotFiles.length; i++) {
      const item = screenshotFiles[i];
      if (typeof item !== "string" && item.size > 0) {
        const ext = item.name.substring(item.name.lastIndexOf(".")) || ".png";
        const scFileName = `sc-${id}-${i + 1}${ext}`;
        const scBuffer = Buffer.from(await item.arrayBuffer());
        const scUpload = await uploadFileToStorage(
          scBuffer,
          scFileName,
          item.type || "image/png",
          "images"
        );
        screenshots.push(scUpload.url);
      }
    }

    if (screenshots.length === 0) {
      screenshots.push("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80");
    }

    const newApp: AppItem = {
      id,
      name,
      packageName,
      version,
      versionCode: 1,
      category,
      developer,
      shortDescription: shortDescription || `${name} application for Android.`,
      description: description || shortDescription || "No detailed description provided.",
      iconUrl,
      screenshots,
      apkFileName: safeApkName,
      apkUrl: apkUpload.url,
      fileSize,
      fileSizeFormatted,
      downloadCount: 0,
      minAndroidVersion,
      changelog,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addApp(newApp);

    return NextResponse.json({
      success: true,
      message: `App uploaded successfully (Storage: ${apkUpload.storageType.toUpperCase()})`,
      app: newApp,
    });
  } catch (error: any) {
    console.error("App upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process app upload" },
      { status: 500 }
    );
  }
}
