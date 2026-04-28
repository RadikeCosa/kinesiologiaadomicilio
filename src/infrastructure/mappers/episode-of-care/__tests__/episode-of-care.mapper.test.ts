import { describe, expect, it } from "vitest";

import { mapFhirEpisodeOfCareToDomain } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import {
  applyFinishEpisodeOfCareToFhir,
  mapStartEpisodeOfCareInputToFhir,
} from "@/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper";

describe("episode-of-care mappers", () => {
  it("maps start input to FHIR EpisodeOfCare without referralRequest", () => {
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

  it("maps start input to FHIR EpisodeOfCare with referralRequest", () => {
    const mapped = mapStartEpisodeOfCareInputToFhir({
      patientId: "pat-1",
      startDate: "2026-04-17",
      serviceRequestId: "sr-1",
    });

    expect(mapped).toEqual({
      resourceType: "EpisodeOfCare",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      referralRequest: [{ reference: "ServiceRequest/sr-1" }],
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
      serviceRequestId: undefined,
    });
  });

  it("maps first valid referralRequest reference to serviceRequestId", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-2",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      referralRequest: [
        { reference: "invalid-reference" },
        { reference: "ServiceRequest/sr-valid" },
      ],
    });

    expect(mapped).toMatchObject({
      id: "epi-2",
      serviceRequestId: "sr-valid",
    });
  });

  it("supports referralRequest references with _history", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-3",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      referralRequest: [{ reference: "ServiceRequest/sr-2/_history/4" }],
    });

    expect(mapped.serviceRequestId).toBe("sr-2");
  });
});
