import { describe, expect, it } from "vitest";

import { mapFhirEpisodeOfCareToDomain } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapStartEpisodeOfCareInputToFhir } from "@/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper";

describe("episode-of-care mappers", () => {
  it("maps start input to FHIR EpisodeOfCare", () => {
    const mapped = mapStartEpisodeOfCareInputToFhir({
      patientId: "pat-1",
      startDate: "2026-04-17",
      description: "Plan inicial",
    });

    expect(mapped).toEqual({
      resourceType: "EpisodeOfCare",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      note: [{ text: "Plan inicial" }],
    });
  });

  it("maps FHIR EpisodeOfCare to domain", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-1",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      note: [{ text: "Plan inicial" }, { text: "Objetivo" }],
    });

    expect(mapped).toEqual({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-17",
      description: "Plan inicial\n\nObjetivo",
    });
  });
});
