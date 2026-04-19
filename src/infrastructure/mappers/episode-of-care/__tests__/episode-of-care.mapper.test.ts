import { describe, expect, it } from "vitest";

import { mapFhirEpisodeOfCareToDomain } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import {
  applyFinishEpisodeOfCareToFhir,
  mapStartEpisodeOfCareInputToFhir,
} from "@/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper";

describe("episode-of-care mappers", () => {
  it("maps start input to FHIR EpisodeOfCare", () => {
    const mapped = mapStartEpisodeOfCareInputToFhir({
      patientId: "pat-1",
      startDate: "2026-04-17",
    });

    expect(mapped).toEqual({
      resourceType: "EpisodeOfCare",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
    });
  });

  it("applies finish over an existing FHIR EpisodeOfCare", () => {
    const mapped = applyFinishEpisodeOfCareToFhir(
      {
        resourceType: "EpisodeOfCare",
        id: "epi-1",
        status: "active",
        patient: { reference: "Patient/pat-1" },
        period: { start: "2026-04-01" },
      },
      { endDate: "2026-04-17" },
    );

    expect(mapped).toEqual({
      resourceType: "EpisodeOfCare",
      id: "epi-1",
      status: "finished",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-01", end: "2026-04-17" },
    });
  });

  it("maps FHIR EpisodeOfCare to domain", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-1",
      status: "finished",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17", end: "2026-04-29" },
    });

    expect(mapped).toEqual({
      id: "epi-1",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-04-17",
      endDate: "2026-04-29",
    });
  });
});
