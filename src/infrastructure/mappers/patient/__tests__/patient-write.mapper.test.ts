import { describe, expect, it } from "vitest";

import {
  DNI_IDENTIFIER_SYSTEM,
  DNI_IDENTIFIER_TYPE_CODING_CODE,
  DNI_IDENTIFIER_TYPE_CODING_SYSTEM,
  DNI_IDENTIFIER_TYPE_TEXT,
} from "@/lib/fhir/identifiers";
import {
  mapCreatePatientInputToFhir,
  mapUpdatePatientInputToFhir,
} from "@/infrastructure/mappers/patient/patient-write.mapper";

describe("patient-write.mapper", () => {
  it("maps create input to FHIR Patient with identifier and contact", () => {
    const mapped = mapCreatePatientInputToFhir({
      firstName: "Ana",
      lastName: "Pérez",
      dni: "32123456",
      phone: "+54 299 555 0101",
      gender: "female",
      birthDate: "1988-01-10",
      address: "Neuquén",
      mainContact: {
        name: "María Pérez",
        relationship: "Madre",
        phone: "+54 299 555 0102",
      },
    });

    expect(mapped).toMatchObject({
      resourceType: "Patient",
      identifier: [
        {
          system: DNI_IDENTIFIER_SYSTEM,
          value: "32123456",
          type: {
            coding: [
              {
                system: DNI_IDENTIFIER_TYPE_CODING_SYSTEM,
                code: DNI_IDENTIFIER_TYPE_CODING_CODE,
                display: DNI_IDENTIFIER_TYPE_TEXT,
              },
            ],
            text: DNI_IDENTIFIER_TYPE_TEXT,
          },
        },
      ],
      name: [{ family: "Pérez", given: ["Ana"] }],
      telecom: [{ system: "phone", value: "+54 299 555 0101" }],
      gender: "female",
      birthDate: "1988-01-10",
      address: [{ text: "Neuquén" }],
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
        telecom: [{ system: "phone", value: "+54 299 555 0101" }],
        gender: "female",
        birthDate: "1988-01-10",
        address: [{ text: "Neuquén" }],
        meta: { lastUpdated: "2026-04-17T00:00:00.000Z" },
      },
      update: {
        id: "pat-1",
        firstName: "Ana María",
        lastName: "Pérez",
        gender: "female",
        dni: undefined,
      },
    });

    expect(mapped.id).toBe("pat-1");
    expect(mapped.name?.[0]).toEqual({ family: "Pérez", given: ["Ana María"] });
    expect(mapped.identifier).toEqual([{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }]);
    expect(mapped.telecom).toEqual([{ system: "phone", value: "+54 299 555 0101" }]);
    expect(mapped.gender).toBe("female");
    expect(mapped.birthDate).toBe("1988-01-10");
    expect(mapped.address).toEqual([{ text: "Neuquén" }]);
    expect(mapped.meta).toEqual({ lastUpdated: "2026-04-17T00:00:00.000Z" });
  });

  it("preserves existing gender and birthDate when update omits both fields", () => {
    const mapped = mapUpdatePatientInputToFhir({
      existing: {
        resourceType: "Patient",
        id: "pat-2",
        name: [{ family: "Suárez", given: ["Lucía"] }],
        gender: "unknown",
        birthDate: "1992-05-20",
      },
      update: {
        id: "pat-2",
        firstName: "Lucía",
        lastName: "Suárez",
      },
    });

    expect(mapped.gender).toBe("unknown");
    expect(mapped.birthDate).toBe("1992-05-20");
  });

  it("preserves legacy DNI identifier without type when update omits dni", () => {
    const mapped = mapUpdatePatientInputToFhir({
      existing: {
        resourceType: "Patient",
        id: "pat-legacy",
        identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "30111222" }],
        name: [{ family: "Gómez", given: ["Bruno"] }],
      },
      update: {
        id: "pat-legacy",
        firstName: "Bruno",
        lastName: "Gómez",
      },
    });

    expect(mapped.identifier).toEqual([{ system: DNI_IDENTIFIER_SYSTEM, value: "30111222" }]);
  });
});
