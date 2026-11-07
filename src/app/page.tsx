"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Download, 
  ShieldCheck, 
  BadgeCheck, 
  Check, 
  HardDrive, 
  Sparkles,
  Layers
} from "lucide-react";
import { AppItem } from "@/types/app";

export default function HomePage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Listen for PWA install prompt on Android
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("category") || "All";
    const search = urlParams.get("search") || "";
    setSelectedCategory(cat);
    fetchApps(cat, search);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setCanInstall(false);
      }
    } else {
      alert("To install directly: Open Chrome menu (3 dots) on your phone and tap 'Install App' or 'Add to Home screen'!");
    }
  };

  const fetchApps = async (cat = selectedCategory, search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (cat !== "All") params.set("category", cat);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/apps?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 📲 Direct App Install Banner for Android */}
      <div className="bg-gradient-to-r from-[#0d1f1b] via-[#0e271f] to-[#0c1a24] border border-[#00e676]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-[#00e676]/10 border border-[#00e676]/30 flex items-center justify-center flex-shrink-0">
            <img src="/logo.webp" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>Install Official APKStore App on Android</span>
              <span className="text-[9px] font-bold uppercase bg-[#00e676] text-slate-950 px-2 py-0.5 rounded-full">Fast</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Install directly on your phone home screen with 1-tap — zero setup required!
            </p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00ff87] text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00e676]/20 whitespace-nowrap flex items-center justify-center gap-2"
        >
          <span>📲 Install App (Direct)</span>
        </button>
      </div>

      {/* Hero Section matching the requested design */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c121e] via-[#0d1424] to-[#0c1e1c] border border-slate-800/90 p-8 sm:p-12 shadow-2xl">
        {/* Neon green cyber grid effect in top right */}
        <div 
          className="absolute right-0 top-0 w-80 h-full opacity-20 pointer-events-none bg-[radial-gradient(#00e676_1px,transparent_1px)] [background-size:16px_16px]" 
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00e676]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400 block">
              DIRECT APK REPOSITORY
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Your Ultimate Android APK Repository.
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Original package signatures, tested builds, direct high-speed download mirrors.
            </p>

            {/* Stats card */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-6 sm:gap-10 px-6 py-3.5 rounded-2xl bg-[#090e18]/90 border border-slate-800 shadow-inner">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-white block">124,512</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total APKs</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-xl sm:text-2xl font-black text-white block">2.1M+</span>
                  <span className="text-[10px] text-slate-400 font-medium">Downloads Today</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-xl sm:text-2xl font-black text-white block">Updated</span>
                  <span className="text-[10px] text-slate-400 font-medium">2m ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explore button */}
          <div className="w-full lg:w-auto flex justify-start lg:justify-end">
            <a
              href="#packages"
              className="px-8 py-4 rounded-2xl bg-[#00e676] hover:bg-[#00ff87] text-slate-950 font-black text-sm tracking-wide transition shadow-lg shadow-[#00e676]/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Explore APKs</span>
            </a>
          </div>
        </div>
      </section>

      {/* Available Packages Section */}
      <section id="packages" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Available Packages</h2>
            <p className="text-xs text-slate-400 mt-1">Showing recent uploads and verified APKs</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["All", "Games", "Apps", "Tools"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  fetchApps(cat);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#00e676] text-slate-950 shadow-md shadow-[#00e676]/20"
                    : "bg-[#0d131f] text-slate-300 border border-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid matching Image 1 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-[#0d131f]/60 border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map((app) => (
              <div
                key={app.id}
                className="group bg-[#0d131f] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-200"
              >
                <div>
                  <div className="flex items-start gap-4">
                    {/* App Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute("src", "/sample-icons/default-app.svg");
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + Verified Check + Shield */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-base font-bold text-white truncate group-hover:text-[#00e676] transition-colors">
                            <Link href={`/apps/${app.id}`}>{app.name}</Link>
                          </h3>
                          <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20 flex-shrink-0" />
                        </div>
                        <ShieldCheck className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                      </div>

                      {/* Package Name */}
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {app.packageName}
                      </p>

                      {/* Version Pill & Size Pill */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono font-medium text-slate-300">
                          <Check className="w-3 h-3 text-[#00e676]" />
                          v{app.version}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono font-medium text-slate-300">
                          <HardDrive className="w-3 h-3 text-slate-400" />
                          {app.fileSizeFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Full-Width Green Action Button */}
                <div className="mt-4 pt-2">
                  <a
                    href={`/api/download/${app.id}`}
                    className="w-full py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00ff87] text-slate-950 font-black text-xs tracking-wide transition shadow-md shadow-[#00e676]/15 flex items-center justify-center gap-2"
                  >
                    <span>Download APK</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
