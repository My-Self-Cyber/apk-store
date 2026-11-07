"use client";

import Link from "next/link";
import { DownloadCloud, UploadCloud, Smartphone, Layers, ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <DownloadCloud className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>APK</span>
              <span className="text-emerald-400">Vault</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Android App Store</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Store</span>
          </Link>

          <Link
            href="/mobile-download"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Mobile App</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Admin Upload</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
