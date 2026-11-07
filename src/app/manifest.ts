import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "APKStore - Safe & Verified",
    short_name: "APKStore",
    description: "Your Ultimate Android APK Repository",
    start_url: "/",
    display: "standalone",
    background_color: "#080c16",
    theme_color: "#00e676",
    icons: [
      {
        src: "/logo.webp",
        sizes: "192x192 512x512",
        type: "image/webp",
        purpose: "any maskable",
      },
    ],
  };
}
