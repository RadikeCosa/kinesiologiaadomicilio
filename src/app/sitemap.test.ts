import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes public routes and excludes admin routes", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://kinesiologiaadomicilio.vercel.app");
    expect(urls).toContain("https://kinesiologiaadomicilio.vercel.app/services");
    expect(urls).toContain("https://kinesiologiaadomicilio.vercel.app/evaluar");
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
  });
});
