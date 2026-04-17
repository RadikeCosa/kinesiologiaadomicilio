import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import {
  createEpisodeOfCare,
  getActiveEpisodeByPatientId,
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
      note: [{ text: "Plan inicial" }],
    });

    const created = await createEpisodeOfCare({
      patientId: "pat-1",
      startDate: "2026-04-17",
      description: "Plan inicial",
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
            note: [{ text: "Plan" }],
          },
        },
      ],
    });

    const episode = await getActiveEpisodeByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledWith("EpisodeOfCare?patient=Patient%2Fpat-1&status=active");
    expect(episode).toMatchObject({ id: "epi-1", patientId: "pat-1", status: "active" });
  });
});
