import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import {
  createEpisodeOfCare,
  finishActiveEpisodeOfCare,
  getActiveEpisodeByPatientId,
  getEpisodeById,
} from "@/infrastructure/repositories/episode-of-care.repository";

describe("episode-of-care.repository (FHIR)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an active episode in FHIR", async () => {
    const postSpy = vi.spyOn(fhirClient, "post").mockResolvedValue({
      resourceType: "EpisodeOfCare",
      id: "epi-1",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
    });

    const created = await createEpisodeOfCare({
      patientId: "pat-1",
      startDate: "2026-04-17",
    });

    expect(postSpy).toHaveBeenCalledWith(
      "EpisodeOfCare",
      expect.objectContaining({
        resourceType: "EpisodeOfCare",
        status: "active",
        patient: { reference: "Patient/pat-1" },
      }),
    );
    expect(created).toMatchObject({ id: "epi-1", patientId: "pat-1", status: "active" });
  });

  it("gets active episode by patient id with simple query", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "EpisodeOfCare",
            id: "epi-1",
            status: "active",
            patient: { reference: "Patient/pat-1" },
            period: { start: "2026-04-17" },
          },
        },
      ],
    });

    const episode = await getActiveEpisodeByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledWith("EpisodeOfCare?patient=Patient%2Fpat-1&status=active");
    expect(episode).toMatchObject({ id: "epi-1", patientId: "pat-1", status: "active" });
  });

  it("finishes active episode using GET + mapper + PUT", async () => {
    const getSpy = vi
      .spyOn(fhirClient, "get")
      .mockResolvedValueOnce({
        resourceType: "Bundle",
        entry: [
          {
            resource: {
              resourceType: "EpisodeOfCare",
              id: "epi-1",
              status: "active",
              patient: { reference: "Patient/pat-1" },
              period: { start: "2026-04-01" },
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        resourceType: "EpisodeOfCare",
        id: "epi-1",
        status: "active",
        patient: { reference: "Patient/pat-1" },
        period: { start: "2026-04-01" },
      });

    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "EpisodeOfCare",
      id: "epi-1",
      status: "finished",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-01", end: "2026-04-17" },
    });

    const finished = await finishActiveEpisodeOfCare({
      patientId: "pat-1",
      endDate: "2026-04-17",
    });

    expect(getSpy).toHaveBeenNthCalledWith(1, "EpisodeOfCare?patient=Patient%2Fpat-1&status=active");
    expect(getSpy).toHaveBeenNthCalledWith(2, "EpisodeOfCare/epi-1");
    expect(putSpy).toHaveBeenCalledWith(
      "EpisodeOfCare/epi-1",
      expect.objectContaining({
        status: "finished",
        period: { start: "2026-04-01", end: "2026-04-17" },
      }),
    );
    expect(finished).toMatchObject({ id: "epi-1", status: "finished", endDate: "2026-04-17" });
  });

  it("gets episode by id", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "EpisodeOfCare",
      id: "epi-10",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-01" },
    });

    const episode = await getEpisodeById("epi-10");

    expect(getSpy).toHaveBeenCalledWith("EpisodeOfCare/epi-10");
    expect(episode).toMatchObject({
      id: "epi-10",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
  });

  it("returns null on getEpisodeById 404", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "not found",
        method: "GET",
        url: "http://fhir.test/EpisodeOfCare/epi-404",
        status: 404,
      }),
    );

    const episode = await getEpisodeById("epi-404");
    expect(episode).toBeNull();
  });
});
