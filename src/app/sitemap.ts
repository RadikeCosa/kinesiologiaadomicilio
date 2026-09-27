import type { MetadataRoute } from "next";
import { BUSINESS_CONFIG } from "@/lib/config";

// Última actualización verificable del contenido de cada ruta pública.
const LAST_PUBLIC_CONTENT_UPDATE = {
  home: new Date("2026-09-27T00:00:00.000Z"),
  services: new Date("2026-09-27T00:00:00.000Z"),
  evaluar: new Date("2026-09-11T00:00:00.000Z"),
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BUSINESS_CONFIG.url;
  return [
    {
      url: base,
      lastModified: LAST_PUBLIC_CONTENT_UPDATE.home,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/services`,
      lastModified: LAST_PUBLIC_CONTENT_UPDATE.services,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/evaluar`,
      lastModified: LAST_PUBLIC_CONTENT_UPDATE.evaluar,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
