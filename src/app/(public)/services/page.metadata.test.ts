import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(public)/services/page";
import { BUSINESS_CONFIG } from "@/lib/config";

describe("/services metadata", () => {
  it("uses route-specific seo metadata", () => {
    expect(metadata.title).toBe("Servicios de kinesiología a domicilio en Neuquén | Rehabilitación y fisioterapia");
    expect(metadata.description).toBe(
      "Servicios de kinesiología a domicilio en Neuquén Capital y zonas cercanas según disponibilidad. Rehabilitación a domicilio y fisioterapia para adultos, postoperatorios, cuidados paliativos y recuperación funcional.",
    );
    expect(metadata.alternates?.canonical).toBe(`${BUSINESS_CONFIG.url}/services`);
  });

  it("defines route-specific open graph and twitter metadata", () => {
    expect(metadata.openGraph?.title).toBe(
      "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación y fisioterapia",
    );
    expect(metadata.openGraph?.description).toBe(
      "Servicios de kinesiología a domicilio en Neuquén Capital y zonas cercanas según disponibilidad. Rehabilitación a domicilio y fisioterapia para adultos, postoperatorios, cuidados paliativos y recuperación funcional.",
    );
    expect(metadata.openGraph?.url).toBe(`${BUSINESS_CONFIG.url}/services`);

    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.title).toBe(
      "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación y fisioterapia",
    );
    expect(metadata.twitter?.description).toBe(
      "Servicios de kinesiología a domicilio en Neuquén Capital y zonas cercanas según disponibilidad. Rehabilitación a domicilio y fisioterapia para adultos, postoperatorios, cuidados paliativos y recuperación funcional.",
    );
  });
});
