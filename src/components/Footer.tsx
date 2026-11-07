import { ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>All uploaded APKs are scanned and safely distributed.</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span>Built for direct Android APK distribution & install</span>
        </div>
      </div>
    </footer>
  );
}
