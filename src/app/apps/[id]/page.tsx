"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  Calendar, 
  Cpu, 
  HardDrive, 
  Code, 
  Layers, 
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { AppItem } from "@/types/app";

export default function AppDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [app, setApp] = useState<AppItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchApp = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/apps/${id}`);
        const data = await res.json();
        if (data.success) {
          setApp(data.app);
        }
      } catch (err) {
        console.error("Error fetching app:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleDownloadClick = () => {
    setDownloading(true);
    // increment local counter visually
    if (app) {
      setApp({ ...app, downloadCount: (app.downloadCount || 0) + 1 });
    }
    setTimeout(() => {
      setDownloading(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded-lg" />
        <div className="h-48 bg-slate-900 rounded-3xl" />
        <div className="h-64 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">App Not Found</h2>
        <p className="text-slate-400 mt-2">The requested application could not be found.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </Link>

      {/* Main Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* App Icon */}
            <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700/60 p-2 shadow-2xl flex-shrink-0 flex items-center justify-center">
              <img
                src={app.iconUrl}
                alt={app.name}
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute("src", "/sample-icons/default-app.svg");
                }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  {app.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  v{app.version}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{app.name}</h1>
              <p className="text-sm text-slate-400">{app.developer}</p>
            </div>
          </div>

          {/* Action button */}
          <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2">
            <a
              href={`/api/download/${app.id}`}
              onClick={handleDownloadClick}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>{downloading ? "Starting Download..." : `Download APK (${app.fileSizeFormatted})`}</span>
            </a>
            <div className="text-center sm:text-right text-xs text-slate-400">
              <span>{app.downloadCount || 0} total downloads</span> • <span>Instant install</span>
            </div>
          </div>
        </div>

        {/* Quick specs pill strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
            <span className="text-slate-500 block">File Size</span>
            <span className="text-white font-mono font-semibold text-sm">{app.fileSizeFormatted}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
            <span className="text-slate-500 block">Version</span>
            <span className="text-white font-mono font-semibold text-sm">{app.version}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
            <span className="text-slate-500 block">Min Requirement</span>
            <span className="text-white font-semibold text-sm">{app.minAndroidVersion}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
            <span className="text-slate-500 block">Package</span>
            <span className="text-white font-mono truncate text-xs block">{app.packageName}</span>
          </div>
        </div>
      </div>

      {/* Screenshots Gallery */}
      {app.screenshots && app.screenshots.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">Preview & Screenshots</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
            {app.screenshots.map((src, idx) => (
              <div
                key={idx}
                className="w-64 sm:w-80 h-44 sm:h-52 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 snap-start shadow-lg"
              >
                <img
                  src={src}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Description & Changelog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">About this app</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {app.description || app.shortDescription}
            </p>
          </div>

          {app.changelog && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>What's New in v{app.version}</span>
              </h2>
              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/60">
                <pre className="text-slate-300 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed">
                  {app.changelog}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Technical Specifications</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block">Package Name</span>
                <span className="text-slate-200 font-mono select-all break-all">{app.packageName}</span>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <span className="text-slate-500 block">APK File Name</span>
                <span className="text-slate-200 font-mono break-all">{app.apkFileName}</span>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <span className="text-slate-500 block">Release Date</span>
                <span className="text-slate-200">
                  {new Date(app.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <span className="text-slate-500 block">Architecture</span>
                <span className="text-slate-200">Universal (armeabi-v7a, arm64-v8a, x86)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`/api/download/${app.id}`}
                className="w-full block text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
              >
                Direct Download Link
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
