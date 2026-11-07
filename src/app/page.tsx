"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { AppItem, CATEGORIES } from "@/types/app";

export default function HomePage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchApps = async (cat = selectedCategory, search = searchQuery) => {
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
      console.error("Error fetching apps:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApps(selectedCategory, searchQuery);
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast & Direct Android Distribution</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Discover & Install <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Verified APKs</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Download latest versions of your favorite Android apps directly without store locks. Admin verified, safe, and lightning fast.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search apps by name, developer, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Categories</span>
          </h2>
          <span className="text-xs text-slate-400">Total {apps.length} apps available</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "All"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Apps Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>{selectedCategory === "All" ? "Featured & Latest Apps" : `${selectedCategory} Apps`}</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 p-8">
            <p className="text-slate-400 font-medium">No apps found matching your query.</p>
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition"
            >
              Upload the first app
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map((app) => (
              <div
                key={app.id}
                className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-emerald-500/5"
              >
                <div>
                  <div className="flex items-start gap-4">
                    {/* App Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md p-1">
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute("src", "/sample-icons/default-app.svg");
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {app.category}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-medium">
                          v{app.version}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white truncate mt-1 group-hover:text-emerald-400 transition-colors">
                        <Link href={`/apps/${app.id}`}>{app.name}</Link>
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{app.developer}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3.5 line-clamp-2 leading-relaxed">
                    {app.shortDescription}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-mono text-slate-300 font-semibold">{app.fileSizeFormatted}</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      {app.downloadCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/apps/${app.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                    >
                      Details
                    </Link>

                    <a
                      href={`/api/download/${app.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md shadow-emerald-500/20"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>APK</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
