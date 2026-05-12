import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import {
  listFunctionalObservationsByEncounterId,
  listFunctionalObservationsByEncounterIds,
} from "@/infrastructure/repositories/observation.repository";

describe("observation.repository (FHIR)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds batch query with encounter references", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({ resourceType: "Bundle", entry: [] });

    await listFunctionalObservationsByEncounterIds(["enc-1", " enc-2 ", "enc-1"]);

    expect(getSpy).toHaveBeenCalledWith("Observation?encounter=Encounter%2Fenc-1%2CEncounter%2Fenc-2");
  });

  it("returns [] for empty batch input", async () => {
    const getSpy = vi.spyOn(fhirClient, "get");

    const result = await listFunctionalObservationsByEncounterIds(["  "]);

    expect(result).toEqual([]);
    expect(getSpy).not.toHaveBeenCalled();
  });

  it("keeps single-encounter method behavior", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({ resourceType: "Bundle", entry: [] });

    await listFunctionalObservationsByEncounterId("enc-1");

    expect(getSpy).toHaveBeenCalledWith("Observation?encounter=Encounter%2Fenc-1");
  });

  it("falls back to controlled per-encounter fetch when batch query is unsupported", async () => {
    const getSpy = vi.spyOn(fhirClient, "get")
      .mockRejectedValueOnce(new FhirClientError({
        message: "unknown search parameter",
        method: "GET",
        url: "http://localhost:8080/fhir/Observation?encounter=Encounter/enc-1,Encounter/enc-2",
        status: 400,
        operationOutcome: {
          resourceType: "OperationOutcome",
          issue: [{ severity: "error", code: "invalid", diagnostics: "Unknown search parameter \"encounter\"" }],
        },
      }))
      .mockResolvedValueOnce({ resourceType: "Bundle", entry: [] })
      .mockResolvedValueOnce({ resourceType: "Bundle", entry: [] });

    const result = await listFunctionalObservationsByEncounterIds(["enc-1", "enc-2"]);

    expect(result).toEqual([]);
    expect(getSpy).toHaveBeenNthCalledWith(1, "Observation?encounter=Encounter%2Fenc-1%2CEncounter%2Fenc-2");
    expect(getSpy).toHaveBeenNthCalledWith(2, "Observation?encounter=Encounter%2Fenc-1");
    expect(getSpy).toHaveBeenNthCalledWith(3, "Observation?encounter=Encounter%2Fenc-2");
  });
});
