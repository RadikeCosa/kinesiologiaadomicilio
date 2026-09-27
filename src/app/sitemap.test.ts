import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { BUSINESS_CONFIG } from "@/lib/config";

const EXPECTED_ROUTES = [
  BUSINESS_CONFIG.url,
  `${BUSINESS_CONFIG.url}/services`,
  `${BUSINESS_CONFIG.url}/evaluar`,
] as const;

const EXPECTED_LASTMOD_ISO = [
  "2026-09-27T00:00:00.000Z",
  "2026-09-27T00:00:00.000Z",
  "2026-09-11T00:00:00.000Z",
] as const;

describe("sitemap", () => {
  it("includes exactly the expected public routes", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(EXPECTED_ROUTES);
  });

  it("keeps admin routes out of the sitemap", () => {
    const entries = sitemap();

    expect(entries.some((entry) => entry.url.includes("/admin"))).toBe(false);
  });

  it("uses absolute URLs on the configured public domain", () => {
    const entries = sitemap();

    entries.forEach((entry) => {
      expect(entry.url.startsWith("https://")).toBe(true);
      expect(entry.url.startsWith(BUSINESS_CONFIG.url)).toBe(true);
    });
  });

  it("uses stable lastModified values", () => {
    const entries = sitemap();

    entries.forEach((entry, index) => {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect((entry.lastModified as Date).toISOString()).toBe(
        EXPECTED_LASTMOD_ISO[index],
      );
    });
  });

  it("preserves changeFrequency and priority contract", () => {
    const entries = sitemap();

    expect(entries).toEqual([
      {
        url: BUSINESS_CONFIG.url,
        lastModified: new Date(EXPECTED_LASTMOD_ISO[0]),
        changeFrequency: "monthly",
        priority: 1,
      },
      {
        url: `${BUSINESS_CONFIG.url}/services`,
        lastModified: new Date(EXPECTED_LASTMOD_ISO[1]),
        changeFrequency: "monthly",
        priority: 0.9,
      },
      {
        url: `${BUSINESS_CONFIG.url}/evaluar`,
        lastModified: new Date(EXPECTED_LASTMOD_ISO[2]),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ]);
  });
});
