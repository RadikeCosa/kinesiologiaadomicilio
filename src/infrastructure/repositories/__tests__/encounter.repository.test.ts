import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { createEncounter, listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";

describe("encounter.repository (FHIR)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates Encounter in FHIR with finished status and period.start/end", async () => {
    const postSpy = vi.spyOn(fhirClient, "post").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T10:30:00Z" },
    });

    const created = await createEncounter({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-17T10:30:00Z",
    });

    expect(postSpy).toHaveBeenCalledWith(
      "Encounter",
      expect.objectContaining({
        resourceType: "Encounter",
        status: "finished",
        subject: { reference: "Patient/pat-1" },
        episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
        period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T10:30:00Z" },
      }),
    );
    expect(created).toEqual({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-17T10:30:00Z",
      status: "finished",
    });
  });

  it("lists encounters by patient using simple query", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "Encounter",
            id: "enc-1",
            status: "finished",
            subject: { reference: "Patient/pat-1" },
            episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
            period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T10:30:00Z" },
          },
        },
      ],
    });

    const list = await listEncountersByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledWith("Encounter?subject=Patient%2Fpat-1");
    expect(list).toEqual([
      {
        id: "enc-1",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        occurrenceDate: "2026-04-17T10:30:00Z",
        status: "finished",
      },
    ]);
  });

  it("returns empty list when patientId is blank", async () => {
    const getSpy = vi.spyOn(fhirClient, "get");

    const list = await listEncountersByPatientId("   ");

    expect(list).toEqual([]);
    expect(getSpy).not.toHaveBeenCalled();
  });
});
