import { describe, expect, it } from "vitest";

import { DNI_IDENTIFIER_SYSTEM } from "@/lib/fhir/identifiers";
import {
  mapCreatePatientInputToFhir,
  mapUpdatePatientInputToFhir,
} from "@/infrastructure/mappers/patient/patient-write.mapper";

describe("patient-write.mapper", () => {
  it("maps create input to FHIR Patient with identifier, contact and notes", () => {
    const mapped = mapCreatePatientInputToFhir({
      firstName: "Ana",
      lastName: "Pérez",
      dni: "32123456",
      phone: "+54 299 555 0101",
      birthDate: "1988-01-10",
      address: "Neuquén",
      notes: "Primera consulta",
      mainContact: {
        name: "María Pérez",
        relationship: "Madre",
        phone: "+54 299 555 0102",
      },
    });

    expect(mapped).toMatchObject({
      resourceType: "Patient",
      identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
      name: [{ family: "Pérez", given: ["Ana"] }],
      telecom: [{ system: "phone", value: "+54 299 555 0101" }],
      birthDate: "1988-01-10",
      address: [{ text: "Neuquén" }],
      note: [{ text: "Primera consulta" }],
      contact: [
        {
          name: { text: "María Pérez" },
          relationship: [{ text: "Madre" }],
          telecom: [{ system: "phone", value: "+54 299 555 0102" }],
        },
      ],
    });
  });

  it("builds update payload via controlled merge over existing resource", () => {
    const mapped = mapUpdatePatientInputToFhir({
      existing: {
        resourceType: "Patient",
        id: "pat-1",
        identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
        name: [{ family: "Pérez", given: ["Ana"] }],
        note: [{ text: "Nota anterior" }],
        meta: { lastUpdated: "2026-04-17T00:00:00.000Z" },
      },
      update: {
        id: "pat-1",
        firstName: "Ana María",
        lastName: "Pérez",
        dni: undefined,
        notes: undefined,
      },
    });

    expect(mapped.id).toBe("pat-1");
    expect(mapped.name?.[0]).toEqual({ family: "Pérez", given: ["Ana María"] });
    expect(mapped.identifier).toBeUndefined();
    expect(mapped.note).toEqual([{ text: "Nota anterior" }]);
    expect(mapped.meta).toEqual({ lastUpdated: "2026-04-17T00:00:00.000Z" });
  });

  it("overwrites note when update includes notes with content", () => {
    const mapped = mapUpdatePatientInputToFhir({
      existing: {
        resourceType: "Patient",
        id: "pat-1",
        name: [{ family: "Pérez", given: ["Ana"] }],
        note: [{ text: "Nota anterior" }],
      },
      update: {
        id: "pat-1",
        firstName: "Ana",
        lastName: "Pérez",
        notes: "Nota nueva",
      },
    });

    expect(mapped.note).toEqual([{ text: "Nota nueva" }]);
  });
});
