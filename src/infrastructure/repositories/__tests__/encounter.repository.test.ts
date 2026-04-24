import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import {
  createEncounter,
  getEncounterById,
  listEncountersByPatientId,
  updateEncounterOccurrenceDateTime,
} from "@/infrastructure/repositories/encounter.repository";

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

  it("gets encounter by id", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T10:30:00Z" },
    });

    const found = await getEncounterById("enc-1");

    expect(found).toEqual({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-17T10:30:00Z",
      status: "finished",
    });
  });

  it("returns null when encounter does not exist (404)", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "not found",
        method: "GET",
        url: "http://fhir.test/Encounter/enc-404",
        status: 404,
      }),
    );

    const found = await getEncounterById("enc-404");

    expect(found).toBeNull();
  });

  it("rethrows non-404 errors when getting encounter by id", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "server error",
        method: "GET",
        url: "http://fhir.test/Encounter/enc-1",
        status: 500,
      }),
    );

    await expect(getEncounterById("enc-1")).rejects.toThrow("server error");
  });

  it("updates occurrence date-time and keeps period.start/end synchronized", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T10:30:00Z" },
    });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-18T09:15:00Z", end: "2026-04-18T09:15:00Z" },
    });

    const updated = await updateEncounterOccurrenceDateTime({
      encounterId: "enc-1",
      patientId: "pat-1",
      occurrenceDate: "2026-04-18T09:15:00Z",
    });

    expect(getSpy).toHaveBeenCalledWith("Encounter/enc-1");
    expect(putSpy).toHaveBeenCalledWith(
      "Encounter/enc-1",
      expect.objectContaining({
        period: {
          start: "2026-04-18T09:15:00Z",
          end: "2026-04-18T09:15:00Z",
        },
      }),
    );
    expect(updated.occurrenceDate).toBe("2026-04-18T09:15:00Z");
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
