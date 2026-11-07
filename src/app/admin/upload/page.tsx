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

      const formData = new FormData();
      formData.append("name", name);
      formData.append("packageName", packageName);
      formData.append("version", version);
      formData.append("category", category);
      formData.append("developer", developer || "Independent Developer");
      formData.append("shortDescription", shortDescription);
      formData.append("description", description);
      formData.append("minAndroidVersion", minAndroidVersion);
      formData.append("changelog", changelog);

      formData.append("apkFile", apkFile);

      if (iconFile) {
        formData.append("iconFile", iconFile);
      }

      screenshotFiles.forEach((file) => {
        formData.append("screenshotFiles", file);
      });

      const res = await fetch("/api/admin/apps", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage("APK uploaded successfully!");
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        setErrorMessage(data.error || "Failed to upload APK");
      }
    } catch (err: any) {
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
                required
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {apkFile ? (
                  <div className="text-xs">
                    <p className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <FileCheck className="w-4 h-4" /> {apkFile.name}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      {(apkFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                ) : (
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200">
                      Click to browse or drag & drop .apk file here
                    </p>
                    <p className="text-slate-500 mt-1">Supports any Android APK package</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* App Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                App Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. My Awesome Game"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Package Name (Application ID)
              </label>
              <input
                type="text"
                placeholder="e.g. com.company.game"
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
                placeholder="e.g. 1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                required
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
                placeholder="e.g. Haroon Studio"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Minimum Android OS
              </label>
              <input
                type="text"
                placeholder="e.g. Android 8.0+ (Oreo)"
                value={minAndroidVersion}
                onChange={(e) => setMinAndroidVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Icon & Screenshots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                App Icon (PNG / JPG / SVG)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Screenshots (Multi-select)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotsChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
              />
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
                placeholder="Brief one-sentence description of what the app does"
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
              <span>{uploading ? "Publishing APK to Store..." : "Publish Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
