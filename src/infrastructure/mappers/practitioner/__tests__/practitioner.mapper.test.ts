import { describe, expect, it } from "vitest";

import { mapFhirPractitionerToSigningProfessionalConfig } from "@/infrastructure/mappers/practitioner/practitioner-read.mapper";
import {
  applySigningProfessionalUpdateToFhirPractitioner,
  mapUpsertSigningProfessionalInputToFhirPractitioner,
} from "@/infrastructure/mappers/practitioner/practitioner-write.mapper";
import {
  PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM,
  PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL,
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
} from "@/infrastructure/mappers/practitioner/practitioner.constants";
import type { FhirPractitioner } from "@/infrastructure/mappers/practitioner/practitioner-fhir.types";

describe("practitioner mapper", () => {
  it("maps FHIR Practitioner to signing professional config", () => {
    const mapped = mapFhirPractitionerToSigningProfessionalConfig({
      resourceType: "Practitioner",
      id: "prac-1",
      identifier: [
        { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
        { system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "MP-123" },
      ],
      name: [{ text: "Nombre Apellido" }],
      telecom: [{ system: "phone", use: "work", value: "299123" }],
      qualification: [{ code: { text: "Lic. en Kinesiologia" }, issuer: { display: "Colegio Provincial" } }],
      extension: [{ url: PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL, valueString: "Firma visible" }],
    });

    expect(mapped).toEqual({
      id: "prac-1",
      fullName: "Nombre Apellido",
      roleTitle: "Lic. en Kinesiologia",
      licenseNumber: "MP-123",
      licenseJurisdiction: "Colegio Provincial",
      signatureDisplay: "Firma visible",
      professionalPhone: "299123",
      status: "ready",
    });
  });

  it("maps incomplete Practitioner without confusing singleton identifier with license", () => {
    const mapped = mapFhirPractitionerToSigningProfessionalConfig({
      resourceType: "Practitioner",
      id: "prac-1",
      identifier: [
        { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
      ],
      name: [{ text: "Nombre Apellido" }],
      qualification: [{ code: { text: "Kinesiologo" } }],
    });

    expect(mapped.licenseNumber).toBeUndefined();
    expect(mapped.status).toBe("incomplete");
  });

  it("maps signing professional input to FHIR Practitioner", () => {
    const mapped = mapUpsertSigningProfessionalInputToFhirPractitioner({
      fullName: "Nombre Apellido",
      roleTitle: "Kinesiologo",
      licenseNumber: "MP-123",
      licenseJurisdiction: "Neuquen",
      signatureDisplay: "Nombre Apellido - MP-123",
      professionalPhone: "299123",
    });

    expect(mapped).toMatchObject({
      resourceType: "Practitioner",
      active: true,
      identifier: [
        { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
        { system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "MP-123" },
      ],
      name: [{ text: "Nombre Apellido" }],
      telecom: [{ system: "phone", use: "work", value: "299123" }],
      qualification: [{ code: { text: "Kinesiologo" }, issuer: { display: "Neuquen" } }],
      extension: [{ url: PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL, valueString: "Nombre Apellido - MP-123" }],
    });
  });

  it("preserves external identifiers, extensions, telecom and fields on update", () => {
    const existing: FhirPractitioner = {
      resourceType: "Practitioner",
      id: "prac-1",
      active: false,
      identifier: [
        { system: "external-system", value: "external-id" },
        { system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "OLD" },
      ],
      name: [{ text: "Viejo" }, { use: "nickname", text: "Alias" }],
      telecom: [
        { system: "email", value: "prof@example.com", use: "work" },
        { system: "phone", value: "old-work-phone", use: "work" },
        { system: "phone", value: "personal", use: "home" },
      ],
      qualification: [
        { code: { text: "Viejo rol" } },
        { code: { text: "Otra calificacion" } },
      ],
      extension: [
        { url: "external-extension", valueString: "keep" },
        { url: PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL, valueString: "old signature" },
      ],
      meta: { lastUpdated: "2026-06-01T00:00:00Z" },
    };

    const updated = applySigningProfessionalUpdateToFhirPractitioner({
      existing,
      input: {
        fullName: "Nuevo Nombre",
        roleTitle: "Nuevo rol",
        licenseNumber: "NEW",
        signatureDisplay: "new signature",
      },
    });

    expect(updated.id).toBe("prac-1");
    expect(updated.meta).toEqual({ lastUpdated: "2026-06-01T00:00:00Z" });
    expect(updated.identifier).toEqual([
      { system: "external-system", value: "external-id" },
      { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
      { system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "NEW", type: { text: "Matricula profesional" } },
    ]);
    expect(updated.extension).toEqual([
      { url: "external-extension", valueString: "keep" },
      { url: PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL, valueString: "new signature" },
    ]);
    expect(updated.telecom).toEqual([
      { system: "email", value: "prof@example.com", use: "work" },
      { system: "phone", value: "personal", use: "home" },
    ]);
    expect(updated.name).toEqual([{ text: "Nuevo Nombre" }, { use: "nickname", text: "Alias" }]);
    expect(updated.qualification).toEqual([
      { code: { text: "Nuevo rol" }, issuer: undefined },
      { code: { text: "Otra calificacion" } },
    ]);
  });
});
