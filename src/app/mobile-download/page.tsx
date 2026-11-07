import Link from "next/link";
import { Smartphone, Download, CheckCircle, ShieldCheck, ArrowLeft, QrCode } from "lucide-react";

export default function MobileDownloadPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Smartphone className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              APKStore Mobile App
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Install the official APKStore Android client directly on your device. Browse, search, and install APKs with 1-tap installation directly from your phone!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>One-click direct APK install without manual downloads folder browsing</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Instant update notifications whenever you publish a new version</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Ultra-lightweight (less than 15 MB) & zero ads</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="https://github.com/My-Self-Cyber/apk-store/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download APKStore Client (v1.0)</span>
            </a>
            <span className="text-xs text-center text-slate-500">Android 7.0+ Supported</span>
          </div>
        </div>
      </div>
    </div>
  );
}
