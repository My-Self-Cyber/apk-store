export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  version: string;
  versionCode: number;
  category: string;
  developer: string;
  shortDescription: string;
  description: string;
  iconUrl: string;
  screenshots: string[];
  apkFileName: string;
  apkUrl: string;
  fileSize: number;
  fileSizeFormatted: string;
  downloadCount: number;
  minAndroidVersion: string;
  changelog: string;
  createdAt: string;
  updatedAt: string;
}

export type Category = 
  | "Games"
  | "Tools"
  | "Productivity"
  | "Social"
  | "Entertainment"
  | "Education"
  | "Finance"
  | "Utilities"
  | "Communication";

export const CATEGORIES: Category[] = [
  "Games",
  "Tools",
  "Productivity",
  "Social",
  "Entertainment",
  "Education",
  "Finance",
  "Utilities",
  "Communication"
];
