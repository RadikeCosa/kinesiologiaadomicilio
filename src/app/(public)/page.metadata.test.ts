import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(public)/layout";
import { BUSINESS_CONFIG } from "@/lib/config";

describe("/ metadata", () => {
  it("uses home-oriented public SEO metadata", () => {
    expect(metadata.title).toBe(
      "Kinesiólogo a domicilio en Neuquén Capital | Rehabilitación en casa",
    );
    expect(metadata.description).toBe(
      "Atención kinesiológica a domicilio en Neuquén Capital para adultos y adultos mayores. Coordiná por WhatsApp una consulta particular con evaluación inicial.",
    );
    expect(metadata.alternates?.canonical).toBe(BUSINESS_CONFIG.url);
  });

  it("keeps Open Graph and Twitter copy aligned with the organic result", () => {
    expect(metadata.openGraph?.title).toBe(metadata.title);
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.title).toBe(metadata.title);
    expect(metadata.twitter?.description).toBe(metadata.description);
  });
});
