import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import {
  createEncounter,
  getEncounterById,
  listEncountersByPatientId,
  updateEncounterClinicalNote,
  updateEncounterTimeRange,
} from "@/infrastructure/repositories/encounter.repository";

function buildFhirEncounter(id: string, startedAt: string) {
  return {
    resourceType: "Encounter" as const,
    id,
    status: "finished",
    subject: { reference: "Patient/pat-1" },
    episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
    period: { start: startedAt, end: startedAt },
  };
}

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
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:00:00Z" },
    });

    const created = await createEncounter({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:00:00Z",
    });

    expect(postSpy).toHaveBeenCalledWith(
      "Encounter",
      expect.objectContaining({
        resourceType: "Encounter",
        status: "finished",
        subject: { reference: "Patient/pat-1" },
        episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
        period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:00:00Z" },
      }),
    );
    expect(created).toEqual({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:00:00Z",
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
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:15:00Z" },
    });

    const found = await getEncounterById("enc-1");

    expect(found).toEqual({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:15:00Z",
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

  it("updates startedAt and endedAt together", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-18T11:30:00Z" },
    });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-18T09:15:00Z", end: "2026-04-18T11:45:00Z" },
    });

    const updated = await updateEncounterTimeRange({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-18T09:15:00Z",
      endedAt: "2026-04-18T11:45:00Z",
    });

    expect(getSpy).toHaveBeenCalledWith("Encounter/enc-1");
    expect(putSpy).toHaveBeenCalledWith(
      "Encounter/enc-1",
      expect.objectContaining({
        period: {
          start: "2026-04-18T09:15:00Z",
          end: "2026-04-18T11:45:00Z",
        },
      }),
    );
    expect(updated.startedAt).toBe("2026-04-18T09:15:00Z");
    expect(updated.endedAt).toBe("2026-04-18T11:45:00Z");
  });

  it("preserves unknown and clinical/punctuality extensions when updating period", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-preserve",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:00:00Z" },
      extension: [
        { url: "https://example.org/fhir/StructureDefinition/external", valueString: "external" },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-note-v1",
          valueString: "nota",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-punctuality-v1",
          valueCode: "on_time",
        },
      ],
    });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-preserve",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      period: { start: "2026-04-18T09:15:00Z", end: "2026-04-18T11:45:00Z" },
    });

    await updateEncounterTimeRange({
      encounterId: "enc-preserve",
      patientId: "pat-1",
      startedAt: "2026-04-18T09:15:00Z",
      endedAt: "2026-04-18T11:45:00Z",
    });

    const payload = putSpy.mock.calls[0]?.[1] as { extension?: Array<{ url: string }> };
    expect(payload.extension?.map((item) => item.url)).toEqual([
      "https://example.org/fhir/StructureDefinition/external",
      "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-note-v1",
      "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-punctuality-v1",
    ]);
  });

  it("updates clinical note with GET merge PUT and preserves non-clinical fields", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-note",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:00:00Z" },
      extension: [
        { url: "https://external.local/ext", valueString: "keep" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1", valueCode: "delayed" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective", valueString: "old" },
      ],
      note: [{ text: "clinical-subjective:v1:legacy" }],
    });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "Encounter",
      id: "enc-note",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:00:00Z" },
      extension: [
        { url: "https://external.local/ext", valueString: "keep" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1", valueCode: "delayed" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective", valueString: "new" },
      ],
    });

    const updated = await updateEncounterClinicalNote({
      encounterId: "enc-note",
      patientId: "pat-1",
      clinicalNote: {
        subjective: "new",
      },
    });

    expect(getSpy).toHaveBeenCalledWith("Encounter/enc-note");
    expect(putSpy).toHaveBeenCalledWith("Encounter/enc-note", expect.objectContaining({
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:00:00Z" },
      note: [{ text: "clinical-subjective:v1:legacy" }],
    }));
    const payload = putSpy.mock.calls[0]?.[1] as { extension?: Array<{ url?: string; valueString?: string; valueCode?: string }> };
    expect(payload.extension).toEqual([
      { url: "https://external.local/ext", valueString: "keep" },
      { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1", valueCode: "delayed" },
      { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective", valueString: "new" },
    ]);
    expect(updated.clinicalNote).toEqual({ subjective: "new" });
  });

  it("lists encounters by patient using explicit date sort", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        {
          resource: buildFhirEncounter("enc-1", "2026-04-17T10:30:00Z"),
        },
      ],
    });

    const list = await listEncountersByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledWith("Encounter?subject=Patient%2Fpat-1&_sort=-date&_count=100");
    expect(list).toEqual([
      {
        id: "enc-1",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-17T10:30:00Z",
        status: "finished",
      },
    ]);
  });

  it("follows Bundle next links and includes encounters from every page", async () => {
    const firstPageEncounters = Array.from({ length: 20 }, (_, index) =>
      buildFhirEncounter(`enc-page-1-${index + 1}`, `2026-04-${String(index + 1).padStart(2, "0")}T10:00:00Z`));
    const nextUrl = "http://fhir.test/Encounter?_getpages=page-2";
    const getSpy = vi.spyOn(fhirClient, "get")
      .mockResolvedValueOnce({
        resourceType: "Bundle",
        entry: firstPageEncounters.map((resource) => ({ resource })),
        link: [
          { relation: "self", url: "http://fhir.test/Encounter?subject=Patient%2Fpat-1&_sort=-date&_count=100" },
          { relation: "next", url: nextUrl },
        ],
      })
      .mockResolvedValueOnce({
        resourceType: "Bundle",
        entry: [
          { resource: buildFhirEncounter("enc-most-recent", "2026-07-14T11:15:00-03:00") },
        ],
      });

    const list = await listEncountersByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(getSpy).toHaveBeenNthCalledWith(1, "Encounter?subject=Patient%2Fpat-1&_sort=-date&_count=100");
    expect(getSpy).toHaveBeenNthCalledWith(2, nextUrl);
    expect(list).toHaveLength(21);
    expect(list.map((encounter) => encounter.id)).toContain("enc-most-recent");
  });

  it("handles bundles without entries", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
    });

    const list = await listEncountersByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(list).toEqual([]);
  });

  it("stops following next links when HAPI repeats a visited URL", async () => {
    const initialSearchPath = "Encounter?subject=Patient%2Fpat-1&_sort=-date&_count=100";
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [{ resource: buildFhirEncounter("enc-1", "2026-04-17T10:30:00Z") }],
      link: [{ relation: "next", url: initialSearchPath }],
    });

    const list = await listEncountersByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(list.map((encounter) => encounter.id)).toEqual(["enc-1"]);
  });

  it("returns empty list when patientId is blank", async () => {
    const getSpy = vi.spyOn(fhirClient, "get");

    const list = await listEncountersByPatientId("   ");

    expect(list).toEqual([]);
    expect(getSpy).not.toHaveBeenCalled();
  });
});
