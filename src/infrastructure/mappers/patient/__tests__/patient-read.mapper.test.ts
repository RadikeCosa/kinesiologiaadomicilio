import { describe, expect, it } from "vitest";

import { DNI_IDENTIFIER_SYSTEM } from "@/lib/fhir/identifiers";
import {
  mapFhirPatientToDomain,
  mapPatientToDetailReadModel,
  mapPatientToListItemReadModel,
} from "@/infrastructure/mappers/patient/patient-read.mapper";

describe("patient-read.mapper", () => {
  it("maps FHIR Patient into domain Patient preserving contact data", () => {
    const mapped = mapFhirPatientToDomain({
      resourceType: "Patient",
      id: "pat-1",
      meta: { lastUpdated: "2026-04-17T12:00:00.000Z" },
      identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
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

    expect(mapped).toEqual({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "32123456",
      phone: "+54 299 555 0101",
      gender: "female",
      birthDate: "1988-01-10",
      address: "Neuquén",
      mainContact: {
        name: "María Pérez",
        relationship: "parent",
        phone: "+54 299 555 0102",
      },
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });
  });

  it("maps legacy FHIR Patient without gender and birthDate", () => {
    const mapped = mapFhirPatientToDomain({
      resourceType: "Patient",
      id: "pat-legacy",
      name: [{ family: "Gómez", given: ["Bruno"] }],
      identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "30111222" }],
    });

    expect(mapped.id).toBe("pat-legacy");
    expect(mapped.firstName).toBe("Bruno");
    expect(mapped.lastName).toBe("Gómez");
    expect(mapped.gender).toBeUndefined();
    expect(mapped.birthDate).toBeUndefined();
  });

  it("joins multiple given values into firstName", () => {
    const mapped = mapFhirPatientToDomain({
      resourceType: "Patient",
      id: "pat-given",
      name: [{ family: "Pérez", given: ["Ana", "María"] }],
    });

    expect(mapped.firstName).toBe("Ana María");
    expect(mapped.lastName).toBe("Pérez");
  });

  it("falls back to name.text when given/family are missing", () => {
    const mapped = mapFhirPatientToDomain({
      resourceType: "Patient",
      id: "pat-text",
      name: [{ text: "Paciente Legacy" }],
    });

    expect(mapped.firstName).toBe("Paciente Legacy");
    expect(mapped.lastName).toBe("");
  });

  it("maps phone from primary telecom with system phone and trims value", () => {
    const mapped = mapFhirPatientToDomain({
      resourceType: "Patient",
      id: "pat-telecom",
      name: [{ family: "Pérez", given: ["Ana"] }],
      telecom: [
        { system: "email", value: "ana@example.com" },
        { system: "phone", value: " +54 299 555 0101 " },
        { system: "phone", value: "+54 299 555 0109" },
      ],
    });

    expect(mapped.phone).toBe("+54 299 555 0101");
  });

  it("normalizes legacy relationship text into transitional relationship catalog on read", () => {
    const mapped = mapFhirPatientToDomain({
      resourceType: "Patient",
      id: "pat-contact",
      name: [{ family: "Pérez", given: ["Ana"] }],
      contact: [
        {
          name: { text: "Marta" },
          relationship: [{ text: "Vecina" }],
        },
      ],
    });

    expect(mapped.mainContact?.relationship).toBe("other");
  });

  it("maps list item status as finished_treatment when latest episode is finished", () => {
    const mapped = mapPatientToListItemReadModel(
      {
        id: "pat-1",
        firstName: "Ana",
        lastName: "Pérez",
        dni: "32123456",
        phone: "+54 299 555 0101",
        gender: "female",
        createdAt: "2026-04-17T12:00:00.000Z",
        updatedAt: "2026-04-17T12:00:00.000Z",
      },
      {
        activeEpisode: null,
        latestEpisode: {
          id: "epi-1",
          patientId: "pat-1",
          status: "finished",
          startDate: "2026-03-01",
          endDate: "2026-04-01",
        },
      },
    );

    expect(mapped.operationalStatus).toBe("finished_treatment");
    expect(mapped.gender).toBe("female");
  });

  it("maps detail status as finished_treatment when latest episode is finished", () => {
    const mapped = mapPatientToDetailReadModel(
      {
        id: "pat-1",
        firstName: "Ana",
        lastName: "Pérez",
        dni: "32123456",
        phone: "+54 299 555 0101",
        gender: "female",
        createdAt: "2026-04-17T12:00:00.000Z",
        updatedAt: "2026-04-17T12:00:00.000Z",
      },
      {
        activeEpisode: null,
        latestEpisode: {
          id: "epi-1",
          patientId: "pat-1",
          status: "finished",
          startDate: "2026-03-01",
          endDate: "2026-04-01",
        },
      },
    );

    expect(mapped.operationalStatus).toBe("finished_treatment");
    expect(mapped.gender).toBe("female");
  });
});
