import { describe, expect, it } from "vitest";

import { upsertSigningProfessionalSchema } from "@/domain/signing-professional/signing-professional.schemas";

describe("upsertSigningProfessionalSchema", () => {
  it("normalizes required and optional text fields", () => {
    expect(upsertSigningProfessionalSchema.parse({
      fullName: "  Nombre   Apellido  ",
      roleTitle: " Lic.   en Kinesiologia ",
      licenseNumber: "  MP-123  ",
      licenseJurisdiction: " Colegio   Provincial ",
      signatureDisplay: "  Lic. Nombre   Apellido - MP-123 ",
      professionalPhone: " 299  123 ",
    })).toEqual({
      fullName: "Nombre Apellido",
      roleTitle: "Lic. en Kinesiologia",
      licenseNumber: "MP-123",
      licenseJurisdiction: "Colegio Provincial",
      signatureDisplay: "Lic. Nombre Apellido - MP-123",
      professionalPhone: "299 123",
    });
  });

  it("allows missing license and optional fields for incomplete config", () => {
    expect(upsertSigningProfessionalSchema.parse({
      fullName: "Nombre Apellido",
      roleTitle: "Kinesiologo",
      licenseNumber: " ",
    })).toEqual({
      fullName: "Nombre Apellido",
      roleTitle: "Kinesiologo",
      licenseNumber: undefined,
      licenseJurisdiction: undefined,
      signatureDisplay: undefined,
      professionalPhone: undefined,
    });
  });

  it("requires fullName and roleTitle", () => {
    expect(() => upsertSigningProfessionalSchema.parse({ fullName: " ", roleTitle: "Kinesiologo" }))
      .toThrow("fullName: es obligatorio.");
    expect(() => upsertSigningProfessionalSchema.parse({ fullName: "Nombre", roleTitle: " " }))
      .toThrow("roleTitle: es obligatorio.");
  });
});
