import type { MetadataRoute } from "next";

// Sitemap inicial: se ampliará cuando se agreguen más rutas (servicios, contacto, etc.)
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kinesiologiaadomicilio.vercel.app";
  const now = new Date();
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
