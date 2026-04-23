import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DNI_IDENTIFIER_SYSTEM,
  DNI_IDENTIFIER_TYPE_CODING_CODE,
  DNI_IDENTIFIER_TYPE_CODING_SYSTEM,
  DNI_IDENTIFIER_TYPE_TEXT,
} from "@/lib/fhir/identifiers";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import {
  createPatient,
  existsAnotherPatientWithDni,
  findPatientByDni,
  getPatientById,
  listPatients,
  updatePatient,
} from "@/infrastructure/repositories/patient.repository";

describe("patient.repository (FHIR)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates and maps patient through FHIR client", async () => {
    vi.spyOn(fhirClient, "post").mockResolvedValue({
      resourceType: "Patient",
      id: "pat-1",
      meta: { lastUpdated: "2026-04-17T12:00:00.000Z" },
      name: [{ family: "Pérez", given: ["Ana"] }],
      identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
      gender: "female",
      birthDate: "1988-01-10",
    });

    const patient = await createPatient({ firstName: "Ana", lastName: "Pérez", dni: "32123456", gender: "female" });

    expect(patient.id).toBe("pat-1");
    expect(patient.dni).toBe("32123456");
    expect(patient.gender).toBe("female");
    expect(patient.birthDate).toBe("1988-01-10");
  });

  it("gets list and find by dni from search bundles", async () => {
    const getSpy = vi.spyOn(fhirClient, "get");
    getSpy.mockResolvedValueOnce({
      resourceType: "Bundle",
      entry: [{ resource: { resourceType: "Patient", id: "pat-1", name: [{ family: "Pérez", given: ["Ana"] }] } }],
    });
    getSpy.mockResolvedValueOnce({
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "pat-2",
            name: [{ family: "Gómez", given: ["Bruno"] }],
            identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "30111222" }],
          },
        },
      ],
    });

    const patients = await listPatients();
    const byDni = await findPatientByDni("30111222");

    expect(patients).toHaveLength(1);
    expect(byDni?.id).toBe("pat-2");
    expect(getSpy).toHaveBeenNthCalledWith(1, "Patient");
    expect(getSpy.mock.calls[1]?.[0]).toContain("Patient?identifier=");
  });

  it("updates via GET then PUT with controlled merge", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Patient",
      id: "pat-1",
      name: [{ family: "Pérez", given: ["Ana"] }],
      identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
      gender: "female",
      birthDate: "1988-01-10",
    });

    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "Patient",
      id: "pat-1",
      meta: { lastUpdated: "2026-04-17T12:00:00.000Z" },
      name: [{ family: "Pérez", given: ["Ana María"] }],
    });

    const updated = await updatePatient({
      id: "pat-1",
      firstName: "Ana María",
      lastName: "Pérez",
      dni: undefined,
    });

    expect(getSpy).toHaveBeenCalledWith("Patient/pat-1");
    expect(putSpy).toHaveBeenCalledWith(
      "Patient/pat-1",
      expect.objectContaining({
        resourceType: "Patient",
        id: "pat-1",
        identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
        gender: "female",
        birthDate: "1988-01-10",
      }),
    );
    expect(updated.firstName).toBe("Ana María");
  });

  it("checks if another patient exists for a DNI", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        { resource: { resourceType: "Patient", id: "pat-1" } },
        { resource: { resourceType: "Patient", id: "pat-2" } },
      ],
    });

    const result = await existsAnotherPatientWithDni({
      dni: "32123456",
      excludePatientId: "pat-1",
    });

    expect(result).toBe(true);
  });

  it("finds patient by DNI when identifier includes type", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "pat-typed",
            name: [{ family: "Typed", given: ["Paciente"] }],
            identifier: [
              {
                system: DNI_IDENTIFIER_SYSTEM,
                value: "30999111",
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
          },
        },
      ],
    });

    const found = await findPatientByDni("30999111");

    expect(found?.id).toBe("pat-typed");
    expect(found?.dni).toBe("30999111");
  });

  it("returns null on get by id not found", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "not found",
        method: "GET",
        url: "http://localhost:8080/fhir/Patient/missing",
        status: 404,
      }),
    );

    const found = await getPatientById("missing");

    expect(found).toBeNull();
  });
});
