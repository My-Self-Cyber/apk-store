"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  UploadCloud, 
  Trash2, 
  Eye, 
  Download, 
  Lock, 
  RefreshCw, 
  HardDrive, 
  Layers, 
  TrendingUp,
  LogOut,
  BadgeCheck,
  ShieldCheck
} from "lucide-react";
import { AppItem } from "@/types/app";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("apk_admin_token");
    if (savedToken) {
      setIsAuthenticated(true);
      loadApps();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("apk_admin_token", data.token);
        setIsAuthenticated(true);
        loadApps();
      } else {
        setLoginError("Invalid password. Please check and try again.");
      }
    } catch (err) {
      setLoginError("Failed to authenticate with server");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("apk_admin_token");
    setIsAuthenticated(false);
  };

  const loadApps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/apps");
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/apps/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setApps(apps.filter((a) => a.id !== id));
      } else {
        alert("Failed to delete app: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error occurred while deleting app");
    } finally {
      setDeletingId(null);
    }
  };

  const totalDownloads = apps.reduce((sum, a) => sum + (a.downloadCount || 0), 0);
  const totalBytes = apps.reduce((sum, a) => sum + (a.fileSize || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  // Login view - Completely secured, zero password hints
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20">
        <div className="bg-[#0d131f] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/30 text-[#00e676] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Portal</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your secure password to manage and upload APK packages
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#080d16] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00e676]"
                required
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#00e676] hover:bg-[#00ff87] text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-[#00e676]/20"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d131f] border border-slate-800/80 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Admin Control Panel</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#00e676]/20 text-[#00e676] rounded-full border border-[#00e676]/30 font-bold uppercase">
              Cloudflare R2 Connected
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Upload, update, and manage your hosted APK applications</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00ff87] text-slate-950 font-black text-sm transition shadow-lg shadow-[#00e676]/20"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Upload New APK</span>
          </Link>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Uploaded Apps</span>
            <p className="text-2xl font-black text-white">{apps.length}</p>
          </div>
        </div>

        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Downloads</span>
            <p className="text-2xl font-black text-white">{totalDownloads}</p>
          </div>
        </div>

        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Cloud Storage Used</span>
            <p className="text-2xl font-black text-white">{totalMB} MB</p>
          </div>
        </div>
      </div>

      {/* Apps Table */}
      <div className="bg-[#0d131f] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Hosted Packages ({apps.length})</h2>
          <button
            onClick={loadApps}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No applications uploaded yet. Click "Upload New APK" to add one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080d16] text-slate-400 font-semibold border-b border-slate-800/80 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Application</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Downloads</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 p-1 flex-shrink-0 border border-slate-700/60">
                          <img
                            src={app.iconUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute("src", "/sample-icons/default-app.svg");
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-sm block truncate">{app.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">{app.packageName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium text-[10px]">
                        {app.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#00e676]">
                      v{app.version}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {app.fileSizeFormatted}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {app.downloadCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/apps/${app.id}`}
                          title="View public page"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <a
                          href={`/api/download/${app.id}`}
                          title="Download APK"
                          className="p-1.5 rounded-lg bg-[#00e676]/20 hover:bg-[#00e676]/30 text-[#00e676] transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(app.id, app.name)}
                          disabled={deletingId === app.id}
                          title="Delete app"
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
