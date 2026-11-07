"use client";

import Link from "next/link";
import { ShieldCheck, User, Search, UploadCloud } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090d16]/95 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo matching the theme */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
            <img 
              src="/logo.webp" 
              alt="APKStore" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // fallback
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight text-white flex items-baseline">
              <span>APK</span>
              <span className="text-[#00e676]">Store</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">SAFE & VERIFIED</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <Link href="/?category=Games" className="hover:text-[#00e676] transition-colors">
            Games
          </Link>
          <Link href="/?category=Apps" className="hover:text-[#00e676] transition-colors">
            Apps
          </Link>
          <Link href="/#packages" className="hover:text-[#00e676] transition-colors">
            Updates
          </Link>
          <Link href="/admin/upload" className="hover:text-[#00e676] transition-colors">
            Upload
          </Link>
        </nav>

        {/* Right side: Search, 100% Virus Free, Admin Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden lg:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search APKs, games, packages..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value;
                  window.location.href = `/?search=${encodeURIComponent(val)}`;
                }
              }}
              className="w-full bg-[#0d131f] border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00e676] transition"
            />
          </div>

          {/* Download Mobile App Button */}
          <a
            href="https://github.com/My-Self-Cyber/apk-store/releases/latest/download/APKStore.apk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00e676] hover:bg-[#00c853] text-black font-extrabold text-xs shadow-md shadow-[#00e676]/20 transition-transform active:scale-95"
            title="Download APKStore Android App"
          >
            <span>📱 Get App</span>
          </a>

          {/* 100% Virus Free Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00e676]/10 border border-[#00e676]/30 text-[#00e676] text-xs font-bold whitespace-nowrap hidden sm:flex">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Virus Free</span>
          </div>

          {/* Admin link */}
          <Link
            href="/admin"
            title="Admin Dashboard"
            className="p-2 rounded-xl bg-[#0d131f] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
