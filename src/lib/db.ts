import fs from "fs";
import path from "path";
import os from "os";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { AppItem, CATEGORIES } from "@/types/app";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";

const r2Client = (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME)
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function syncDbToR2(apps: AppItem[]): Promise<void> {
  if (!r2Client) return;
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: "db/apps.json",
        Body: JSON.stringify(apps, null, 2),
        ContentType: "application/json",
      })
    );
  } catch (err) {
    console.error("Failed to sync DB to R2:", err);
  }
}

export async function loadDbFromR2(): Promise<AppItem[] | null> {
  if (!r2Client) return null;
  try {
    const res = await r2Client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: "db/apps.json",
      })
    );
    if (res.Body) {
      const text = await res.Body.transformToString();
      const parsed = JSON.parse(text) as AppItem[];
      inMemoryApps = parsed;
      return parsed;
    }
  } catch (err) {}
  return null;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "apps.json");
const TMP_DB_FILE = path.join(os.tmpdir(), "apps.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

let inMemoryApps: AppItem[] | null = null;

function ensureDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {}

  try {
    if (!fs.existsSync(path.join(UPLOAD_DIR, "apks"))) {
      fs.mkdirSync(path.join(UPLOAD_DIR, "apks"), { recursive: true });
    }
    if (!fs.existsSync(path.join(UPLOAD_DIR, "images"))) {
      fs.mkdirSync(path.join(UPLOAD_DIR, "images"), { recursive: true });
    }
  } catch (e) {}
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
    id: "movieboxpro-mw6c373k",
    name: "MovieBoxPro",
    packageName: "com.app.base",
    version: "13.1",
    versionCode: 1,
    category: "Entertainment",
    developer: "Perhar studio",
    shortDescription: "MovieBoxPro high-speed entertainment and media player for Android.",
    description: "Stream and download your favorite movies, series, and entertainment content in high resolution on Android.",
    iconUrl: "/api/storage/images/1794051745113-Moviebox-Pro.webp",
    screenshots: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "base.apk",
    apkUrl: "/api/storage/apks/1794051728249-base.apk",
    fileSize: 74942970,
    fileSizeFormatted: "71.5 MB",
    downloadCount: 120,
    minAndroidVersion: "Android 8.0+",
    changelog: "Fixed Update",
    createdAt: "2026-11-07T11:42:26.480Z",
    updatedAt: "2026-11-07T11:42:26.480Z",
  },
  {
    id: "apex-moto-pro",
    name: "Apex Moto Pro",
    packageName: "com.game.apexmotopro",
    version: "1.0.4",
    versionCode: 104,
    category: "Games",
    developer: "SpeedForge Interactive",
    shortDescription: "High-octane motorcycle racing simulator with dynamic weather physics.",
    description: "Experience extreme superbike racing with authentic sound physics, customizable livery, and intense online multiplayer tournaments.",
    iconUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "apex-moto-pro-1.0.4.apk",
    apkUrl: "/uploads/apks/sample-apex-moto.apk",
    fileSize: 67633152,
    fileSizeFormatted: "64.5 MB",
    downloadCount: 42100,
    minAndroidVersion: "Android 9.0+",
    changelog: "• Added 2 new championship tracks\n• Improved gyroscope steering response\n• Physics engine update",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-07T08:00:00.000Z",
  },
  {
    id: "football-3d-arena",
    name: "Football 3D Arena",
    packageName: "com.sports.football3d",
    version: "2.1.0",
    versionCode: 210,
    category: "Games",
    developer: "StadiumPulse Studios",
    shortDescription: "Realistic football simulation with fluid motions and authentic stadium atmospheres.",
    description: "Lead your dream club to the world championship in Football 3D Arena! Full tactical controls, career manager mode, and motion-captured animations.",
    iconUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "football-3d-2.1.0.apk",
    apkUrl: "/uploads/apks/sample-football.apk",
    fileSize: 118279168,
    fileSizeFormatted: "112.8 MB",
    downloadCount: 89400,
    minAndroidVersion: "Android 8.0+",
    changelog: "• 2026 World Tournament roster updates\n• New penalty shootout mechanics\n• 60 FPS graphics unlock",
    createdAt: "2026-10-25T14:00:00.000Z",
    updatedAt: "2026-11-06T12:00:00.000Z",
  },
  {
    id: "vfx-flow-player",
    name: "VFX Flow Player",
    packageName: "com.tools.vfxflow",
    version: "0.9.8",
    versionCode: 98,
    category: "Tools",
    developer: "CreativeEngine Labs",
    shortDescription: "Ultra-smooth 4K video player with hardware decoding and audio boost.",
    description: "VFX Flow Player provides gesture playback, multi-track subtitle syncing, floating picture-in-picture window, and studio equalizer.",
    iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "vfx-flow-0.9.8.apk",
    apkUrl: "/uploads/apks/sample-vfxflow.apk",
    fileSize: 19084083,
    fileSizeFormatted: "18.2 MB",
    downloadCount: 31200,
    minAndroidVersion: "Android 7.0+",
    changelog: "• Added AV1 codec hardware acceleration\n• Background audio playback\n• Subtitle delay adjuster",
    createdAt: "2026-10-18T11:00:00.000Z",
    updatedAt: "2026-11-05T09:30:00.000Z",
  },
  {
    id: "android-player",
    name: "Android Player",
    packageName: "com.media.androidplayer",
    version: "1.0.0",
    versionCode: 100,
    category: "Apps",
    developer: "Apex Core Works",
    shortDescription: "Clean, ad-free media library and playlist manager.",
    description: "Modern Android audio and video suite supporting lossless FLAC, ALAC, MP4, and MKV with smart metadata tag editing.",
    iconUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "android-player-1.0.0.apk",
    apkUrl: "/uploads/apks/sample-player.apk",
    fileSize: 12582912,
    fileSizeFormatted: "12.0 MB",
    downloadCount: 15400,
    minAndroidVersion: "Android 8.0+",
    changelog: "• Initial public release\n• High-resolution album art support\n• Sleep timer feature",
    createdAt: "2026-11-02T16:00:00.000Z",
    updatedAt: "2026-11-06T15:00:00.000Z",
  },
  {
    id: "photo-ai",
    name: "Photo AI",
    packageName: "com.camera.photoai",
    version: "1.5.0",
    versionCode: 150,
    category: "Apps",
    developer: "NeuralVision Inc.",
    shortDescription: "On-device AI photo enhancer, blur fixer, and background remover.",
    description: "Enhance grainy photos, upscale old pictures to 4K, remove photobombers with magic eraser, and apply cinematic color grading.",
    iconUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "photo-ai-1.5.0.apk",
    apkUrl: "/uploads/apks/sample-photoai.apk",
    fileSize: 47290777,
    fileSizeFormatted: "45.1 MB",
    downloadCount: 52800,
    minAndroidVersion: "Android 10+",
    changelog: "• Neural HDR engine upgrade\n• 2x faster background cutout\n• New vintage lens filters",
    createdAt: "2026-09-30T10:00:00.000Z",
    updatedAt: "2026-11-04T18:00:00.000Z",
  },
  {
    id: "sound-equalizer",
    name: "Sound Equalizer",
    packageName: "com.audio.soundeq",
    version: "0.8.0",
    versionCode: 80,
    category: "Tools",
    developer: "AcousticPro Studio",
    shortDescription: "10-band audio equalizer with 3D virtualizer and bass boost.",
    description: "Maximize your headphones and phone speaker potential with custom sound presets, 3D surround sound effect, and loudness maximizer.",
    iconUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80"
    ],
    apkFileName: "sound-eq-0.8.0.apk",
    apkUrl: "/uploads/apks/sample-soundeq.apk",
    fileSize: 8912896,
    fileSizeFormatted: "8.5 MB",
    downloadCount: 22100,
    minAndroidVersion: "Android 7.0+",
    changelog: "• New Bass Boost algorithm\n• Auto-detect headphone model\n• Reduced battery usage",
    createdAt: "2026-10-12T08:00:00.000Z",
    updatedAt: "2026-11-03T11:20:00.000Z",
  }
];

export function getDb(): AppItem[] {
  if (inMemoryApps) {
    return inMemoryApps;
  }

  ensureDirs();

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      inMemoryApps = JSON.parse(raw) as AppItem[];
      return inMemoryApps;
    }
  } catch (err) {}

  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const raw = fs.readFileSync(TMP_DB_FILE, "utf-8");
      inMemoryApps = JSON.parse(raw) as AppItem[];
      return inMemoryApps;
    }
  } catch (err) {}

  inMemoryApps = [...SEED_APPS];
  saveDb(inMemoryApps);
  return inMemoryApps;
}

export function saveDb(apps: AppItem[]): void {
  inMemoryApps = apps;
  ensureDirs();

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(apps, null, 2), "utf-8");
  } catch (err) {}

  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(apps, null, 2), "utf-8");
  } catch (err) {}

  // Sync permanently to Cloudflare R2 cloud storage
  syncDbToR2(apps).catch((e) => console.error("R2 sync error:", e));
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
