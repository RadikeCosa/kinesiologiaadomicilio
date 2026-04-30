import type { MetadataRoute } from "next";
import { BUSINESS_CONFIG } from "@/lib/config";

// Sitemap público estable de rutas públicas; ampliar cuando se agreguen nuevas páginas.
const LAST_PUBLIC_CONTENT_UPDATE = new Date("2026-04-30T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BUSINESS_CONFIG.url;
  return [
    {
      url: base,
      lastModified: LAST_PUBLIC_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/services`,
      lastModified: LAST_PUBLIC_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/evaluar`,
      lastModified: LAST_PUBLIC_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
