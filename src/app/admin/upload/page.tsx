"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  UploadCloud, 
  FileCheck, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { CATEGORIES } from "@/types/app";

export default function UploadAppPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [category, setCategory] = useState("Tools");
  const [developer, setDeveloper] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [minAndroidVersion, setMinAndroidVersion] = useState("Android 8.0+");
  const [changelog, setChangelog] = useState("Initial Release");

  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setApkFile(file);

      // Auto-populate name & package name if empty
      if (!name) {
        const cleanName = file.name.replace(/\.apk$/i, "").replace(/[-_]/g, " ");
        setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      if (!packageName) {
        const safeSlug = file.name
          .replace(/\.apk$/i, "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        setPackageName(`com.app.${safeSlug || "package"}`);
      }
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshotFiles(Array.from(e.target.files));
    }
  };

  // Direct upload to Cloudflare R2 with progress tracking
  const uploadDirectToR2 = async (
    file: File,
    subFolder: "apks" | "images",
    onProgress?: (percent: number) => void
  ): Promise<{ publicUrl: string; objectKey: string }> => {
    const presignRes = await fetch("/api/admin/get-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || (subFolder === "apks" ? "application/vnd.android.package-archive" : "image/png"),
        subFolder,
      }),
    });

    const presignData = await presignRes.json();
    if (!presignData.success || !presignData.uploadUrl) {
      throw new Error(presignData.error || "Failed to obtain secure Cloudflare R2 upload link");
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignData.uploadUrl, true);
      xhr.setRequestHeader(
        "Content-Type", 
        file.type || (subFolder === "apks" ? "application/vnd.android.package-archive" : "image/png")
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            publicUrl: presignData.publicUrl,
            objectKey: presignData.objectKey,
          });
        } else {
          reject(new Error(`Direct Cloudflare R2 upload returned status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Cloudflare R2 direct upload failed. Please ensure CORS is enabled on your R2 bucket."));
      };

      xhr.send(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter an App Name");
      return;
    }

    if (!apkFile) {
      setErrorMessage("Please select a valid .APK file to upload");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStage("Preparing direct upload to Cloudflare R2...");

      // 1. Upload APK directly to R2 with live progress bar
      setUploadStage(`Uploading ${apkFile.name} (0%)...`);
      const apkUpload = await uploadDirectToR2(apkFile, "apks", (pct) => {
        setUploadProgress(pct);
        setUploadStage(`Uploading ${apkFile.name}: ${pct}%`);
      });

      // 2. Upload Icon if selected
      let iconUrl = "/sample-icons/default-app.svg";
      if (iconFile) {
        setUploadStage("Uploading application icon...");
        const iconUpload = await uploadDirectToR2(iconFile, "images");
        iconUrl = iconUpload.publicUrl;
      }

      // 3. Upload Screenshots if selected
      const screenshots: string[] = [];
      if (screenshotFiles.length > 0) {
        setUploadStage("Uploading screenshots...");
        for (let i = 0; i < screenshotFiles.length; i++) {
          const scUpload = await uploadDirectToR2(screenshotFiles[i], "images");
          screenshots.push(scUpload.publicUrl);
        }
      }

      // 4. Publish metadata to Database
      setUploadStage("Publishing package to APKStore...");
      const res = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          packageName,
          version,
          category,
          developer: developer || "Independent Developer",
          shortDescription,
          description,
          minAndroidVersion,
          changelog,
          apkUrl: apkUpload.publicUrl,
          apkFileName: apkFile.name,
          fileSize: apkFile.size,
          iconUrl,
          screenshots,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUploadProgress(100);
        setUploadStage("Upload Complete!");
        setSuccessMessage("APK uploaded and published successfully!");
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        setErrorMessage(data.error || "Failed to publish APK");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Network error while uploading");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Release</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Upload Android APK</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fill in the app metadata and upload the .APK binary for distribution.
          </p>
        </div>

        {/* Live Upload Progress Indicator */}
        {uploading && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>{uploadStage}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-[#00e676] transition-all duration-150 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage} Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* APK File Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              Android APK Binary (.apk) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition bg-slate-950/50">
              <input
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={handleApkChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={!apkFile}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {apkFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>{apkFile.name}</span>
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {(apkFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Drop .APK file here or <span className="text-emerald-400 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Direct Cloudflare R2 Upload (up to 2 GB per file)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* App Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                App Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Telegram"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Package Name (Application ID)
              </label>
              <input
                type="text"
                placeholder="e.g., org.telegram.messenger"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Version Name
              </label>
              <input
                type="text"
                placeholder="e.g., 10.9.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Developer / Studio Name
              </label>
              <input
                type="text"
                placeholder="e.g., Telegram FZ-LLC"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Minimum Android Version
              </label>
              <input
                type="text"
                placeholder="e.g., Android 8.0+"
                value={minAndroidVersion}
                onChange={(e) => setMinAndroidVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Media Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                App Icon (.png, .webp, .svg)
              </label>
              <div className="relative border border-slate-800 rounded-xl p-3 text-center bg-slate-950 hover:border-slate-700 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span className="truncate max-w-[200px]">
                    {iconFile ? iconFile.name : "Choose Icon File"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Screenshots (Multiple allowed)
              </label>
              <div className="relative border border-slate-800 rounded-xl p-3 text-center bg-slate-950 hover:border-slate-700 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotsChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>
                    {screenshotFiles.length > 0 
                      ? `${screenshotFiles.length} screenshots chosen` 
                      : "Choose Screenshots"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Short Tagline / Summary
              </label>
              <input
                type="text"
                placeholder="Brief one-line highlight (shown in cards)"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Full Description
              </label>
              <textarea
                rows={4}
                placeholder="Detailed features, how to use, key highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Changelog (What's New)
              </label>
              <textarea
                rows={2}
                placeholder="• Bug fixes and speed improvements&#10;• New feature added"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-5 h-5 stroke-[2.5]" />
              <span>{uploading ? (uploadStage || "Publishing APK to Store...") : "Publish Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
