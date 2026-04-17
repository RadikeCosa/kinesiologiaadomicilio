import { describe, expect, it } from "vitest";

import { DNI_IDENTIFIER_SYSTEM } from "@/lib/fhir/identifiers";
import { mapFhirPatientToDomain } from "@/infrastructure/mappers/patient/patient-read.mapper";

describe("patient-read.mapper", () => {
  it("maps FHIR Patient into domain Patient preserving contact and multi-note", () => {
    const mapped = mapFhirPatientToDomain({
      resourceType: "Patient",
      id: "pat-1",
      meta: { lastUpdated: "2026-04-17T12:00:00.000Z" },
      identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
      name: [{ family: "Pérez", given: ["Ana"] }],
      telecom: [{ system: "phone", value: "+54 299 555 0101" }],
      birthDate: "1988-01-10",
      address: [{ text: "Neuquén" }],
      note: [{ text: "Nota 1" }, { text: "Nota 2" }],
      contact: [
        {
          name: { text: "María Pérez" },
          relationship: [{ text: "Madre" }],
          telecom: [{ system: "phone", value: "+54 299 555 0102" }],
        },
      ],
    });

    expect(mapped).toEqual({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "32123456",
      phone: "+54 299 555 0101",
      birthDate: "1988-01-10",
      address: "Neuquén",
      notes: "Nota 1\n\nNota 2",
      mainContact: {
        name: "María Pérez",
        relationship: "Madre",
        phone: "+54 299 555 0102",
      },
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });
  });
});
