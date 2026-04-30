import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(public)/services/page";
import { BUSINESS_CONFIG } from "@/lib/config";

describe("/services metadata", () => {
  it("uses route-specific seo metadata", () => {
    expect(metadata.title).toBe("Servicios de kinesiología y fisioterapia a domicilio en Neuquén");
    expect(metadata.description).toBe(
      "Kinesiología a domicilio en Neuquén con enfoque en rehabilitación y fisioterapia a domicilio como complemento terapéutico. Atención para adultos, adultos mayores, postoperatorios, cuidados paliativos y recuperación funcional.",
    );
    expect(metadata.alternates?.canonical).toBe(`${BUSINESS_CONFIG.url}/services`);
  });

  it("defines route-specific open graph and twitter metadata", () => {
    expect(metadata.openGraph?.title).toBe(
      "Servicios de kinesiología y fisioterapia a domicilio en Neuquén",
    );
    expect(metadata.openGraph?.description).toBe(
      "Kinesiología a domicilio en Neuquén con enfoque en rehabilitación y fisioterapia a domicilio como complemento terapéutico. Atención para adultos, adultos mayores, postoperatorios, cuidados paliativos y recuperación funcional.",
    );
    expect(metadata.openGraph?.url).toBe(`${BUSINESS_CONFIG.url}/services`);

    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.title).toBe(
      "Servicios de kinesiología y fisioterapia a domicilio en Neuquén",
    );
    expect(metadata.twitter?.description).toBe(
      "Kinesiología a domicilio en Neuquén con enfoque en rehabilitación y fisioterapia a domicilio como complemento terapéutico. Atención para adultos, adultos mayores, postoperatorios, cuidados paliativos y recuperación funcional.",
    );
  });
});
