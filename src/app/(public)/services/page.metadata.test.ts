import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(public)/services/page";
import { BUSINESS_CONFIG } from "@/lib/config";

describe("/services metadata", () => {
  it("uses route-specific seo metadata", () => {
    expect(metadata.title).toBe("Servicios de rehabilitación a domicilio en Neuquén Capital");
    expect(metadata.description).toBe(
      "Situaciones atendidas en kinesiología a domicilio para adultos y adultos mayores en Neuquén Capital, con rehabilitación funcional y evaluación inicial según cada caso.",
    );
    expect(metadata.alternates?.canonical).toBe(`${BUSINESS_CONFIG.url}/services`);
  });

  it("defines route-specific open graph and twitter metadata", () => {
    expect(metadata.openGraph?.title).toBe(
      "Servicios de rehabilitación a domicilio en Neuquén Capital",
    );
    expect(metadata.openGraph?.description).toBe(
      "Situaciones atendidas en kinesiología a domicilio para adultos y adultos mayores en Neuquén Capital, con rehabilitación funcional y evaluación inicial según cada caso.",
    );
    expect(metadata.openGraph?.url).toBe(`${BUSINESS_CONFIG.url}/services`);

    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.title).toBe(
      "Servicios de rehabilitación a domicilio en Neuquén Capital",
    );
    expect(metadata.twitter?.description).toBe(
      "Situaciones atendidas en kinesiología a domicilio para adultos y adultos mayores en Neuquén Capital, con rehabilitación funcional y evaluación inicial según cada caso.",
    );
  });
});
