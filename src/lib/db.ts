import fs from "fs";
import path from "path";
import os from "os";
import { AppItem, CATEGORIES } from "@/types/app";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "apps.json");
const TMP_DB_FILE = path.join(os.tmpdir(), "apps.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// In-memory cache for serverless environments (Vercel)
let inMemoryApps: AppItem[] | null = null;

// Ensure directories exist safely
function ensureDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Read-only filesystem in Vercel serverless, silently ignore
  }

  try {
    if (!fs.existsSync(path.join(UPLOAD_DIR, "apks"))) {
      fs.mkdirSync(path.join(UPLOAD_DIR, "apks"), { recursive: true });
    }
    if (!fs.existsSync(path.join(UPLOAD_DIR, "images"))) {
      fs.mkdirSync(path.join(UPLOAD_DIR, "images"), { recursive: true });
    }
  } catch (e) {
    // Read-only filesystem in Vercel serverless, silently ignore
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const SEED_APPS: AppItem[] = [
  {
    id: "quick-notes-pro",
    name: "Quick Notes Pro",
    packageName: "com.apkstore.quicknotes",
    version: "2.4.0",
    versionCode: 24,
    category: "Productivity",
    developer: "Antigravity Devs",
    shortDescription: "Ultra-fast offline markdown notes and checklists.",
    description: "Quick Notes Pro is a clean, minimal, distraction-free note-taking application designed for productivity. Take notes, make task checklists, format using markdown, and backup everything safely on your local device.",
    iconUrl: "/sample-icons/notes.svg",
    screenshots: [
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "quicknotes-2.4.0.apk",
    apkUrl: "/uploads/apks/sample-quicknotes.apk",
    fileSize: 8400000,
    fileSizeFormatted: "8.0 MB",
    downloadCount: 342,
    minAndroidVersion: "Android 8.0+",
    changelog: "• Added dark mode\n• Export notes to PDF\n• Bug fixes and speed improvements",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-05T14:20:00.000Z",
  },
  {
    id: "retro-runner-arcade",
    name: "Retro Runner 2D",
    packageName: "com.apkstore.retrorunner",
    version: "1.0.5",
    versionCode: 105,
    category: "Games",
    developer: "PixelForge Studios",
    shortDescription: "Exciting 8-bit endless runner with synthwave music.",
    description: "Dodge obstacles, collect coins, and unlock neon retro skins in this high-speed endless runner! Perfect for casual gaming sessions.",
    iconUrl: "/sample-icons/runner.svg",
    screenshots: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "retrorunner-1.0.5.apk",
    apkUrl: "/uploads/apks/sample-retrorunner.apk",
    fileSize: 24500000,
    fileSizeFormatted: "23.4 MB",
    downloadCount: 1280,
    minAndroidVersion: "Android 9.0+",
    changelog: "• 3 new cyber tracks added\n• Leaderboard synchronization\n• Performance optimizations",
    createdAt: "2026-10-20T12:00:00.000Z",
    updatedAt: "2026-11-04T09:15:00.000Z",
  },
  {
    id: "smart-file-manager",
    name: "Smart File Explorer",
    packageName: "com.apkstore.filemanager",
    version: "3.1.2",
    versionCode: 312,
    category: "Tools",
    developer: "CoreUtility Apps",
    shortDescription: "Clean, ad-free file manager with APK installer.",
    description: "Manage your internal storage, SD card, and USB OTG drives seamlessly. Includes built-in APK extractor and package installer with permission inspector.",
    iconUrl: "/sample-icons/files.svg",
    screenshots: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "smartfiles-3.1.2.apk",
    apkUrl: "/uploads/apks/sample-smartfiles.apk",
    fileSize: 12800000,
    fileSizeFormatted: "12.2 MB",
    downloadCount: 890,
    minAndroidVersion: "Android 7.0+",
    changelog: "• Support for Android 15\n• Faster search indexing\n• ZIP/RAR support",
    createdAt: "2026-09-15T08:30:00.000Z",
    updatedAt: "2026-11-02T16:45:00.000Z",
  }
];

export function getDb(): AppItem[] {
  if (inMemoryApps) {
    return inMemoryApps;
  }

  ensureDirs();

  // Try reading from persistent DB file
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      inMemoryApps = JSON.parse(raw) as AppItem[];
      return inMemoryApps;
    }
  } catch (err) {
    // If reading failed, continue to fallback
  }

  // Try reading from /tmp on serverless
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const raw = fs.readFileSync(TMP_DB_FILE, "utf-8");
      inMemoryApps = JSON.parse(raw) as AppItem[];
      return inMemoryApps;
    }
  } catch (err) {
    // Continue
  }

  // Fallback to seed data
  inMemoryApps = [...SEED_APPS];
  saveDb(inMemoryApps);
  return inMemoryApps;
}

export function saveDb(apps: AppItem[]): void {
  inMemoryApps = apps;
  ensureDirs();

  // Try saving to project data dir
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(apps, null, 2), "utf-8");
    return;
  } catch (err) {
    // Read-only filesystem in Vercel
  }

  // Fallback to /tmp on serverless
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(apps, null, 2), "utf-8");
  } catch (err) {
    // In-memory cache handles it
  }
}

export function getAllApps(category?: string, search?: string): AppItem[] {
  let apps = getDb();

  if (category && category !== "All") {
    apps = apps.filter(
      (a) => a.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    apps = apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.packageName.toLowerCase().includes(q) ||
        a.developer.toLowerCase().includes(q)
    );
  }

  return [...apps].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getAppById(id: string): AppItem | null {
  const apps = getDb();
  return apps.find((a) => a.id === id) || null;
}

export function getAppByPackage(packageName: string): AppItem | null {
  const apps = getDb();
  return apps.find((a) => a.packageName.toLowerCase() === packageName.toLowerCase()) || null;
}

export function addApp(app: AppItem): AppItem {
  const apps = getDb();
  apps.unshift(app);
  saveDb(apps);
  return app;
}

export function updateApp(id: string, updates: Partial<AppItem>): AppItem | null {
  const apps = getDb();
  const index = apps.findIndex((a) => a.id === id);
  if (index === -1) return null;

  apps[index] = {
    ...apps[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDb(apps);
  return apps[index];
}

export function deleteApp(id: string): boolean {
  const apps = getDb();
  const filtered = apps.filter((a) => a.id !== id);
  if (filtered.length === apps.length) return false;
  saveDb(filtered);
  return true;
}

export function incrementDownload(id: string): number | null {
  const apps = getDb();
  const app = apps.find((a) => a.id === id);
  if (!app) return null;
  app.downloadCount = (app.downloadCount || 0) + 1;
  saveDb(apps);
  return app.downloadCount;
}
