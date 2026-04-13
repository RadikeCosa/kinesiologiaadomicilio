import type { MetadataRoute } from "next";
import { BUSINESS_CONFIG } from "@/lib/config";

// Sitemap actual de rutas públicas; ampliar cuando se agreguen nuevas páginas.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = BUSINESS_CONFIG.url;
  const now = new Date();
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
