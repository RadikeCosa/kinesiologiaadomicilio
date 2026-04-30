import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(public)/evaluar/page";
import { BUSINESS_CONFIG } from "@/lib/config";

describe("/evaluar metadata", () => {
  it("keeps canonical aligned with BUSINESS_CONFIG.url", () => {
    expect(metadata.alternates?.canonical).toBe(`${BUSINESS_CONFIG.url}/evaluar`);
  });

  it("defines route-specific open graph and twitter metadata", () => {
    expect(metadata.openGraph?.url).toBe(`${BUSINESS_CONFIG.url}/evaluar`);
    expect(metadata.openGraph?.type).toBe("website");
    expect(metadata.openGraph?.locale).toBe("es_AR");

    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.title).toBeTypeOf("string");
    expect(metadata.twitter?.description).toBeTypeOf("string");
  });
});
