import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Engram: learn NeuroAI from scratch",
    short_name: "Engram",
    description: "A free, day-by-day course from mathematics to independent NeuroAI research.",
    id: "/today",
    start_url: "/today?source=app",
    scope: "/",
    display: "standalone",
    background_color: "#111018",
    theme_color: "#111018",
    categories: ["education", "science"],
    lang: "en-GB",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Today", url: "/today?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Spaced review", url: "/review?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Curriculum", url: "/curriculum?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
