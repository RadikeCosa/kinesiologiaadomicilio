import { describe, expect, it } from "vitest";

import { mapFhirEncounterToDomain } from "@/infrastructure/mappers/encounter/encounter-read.mapper";
import {
  mapCreateEncounterInputToFhir,
  mapEncounterStartDateTimeUpdate,
} from "@/infrastructure/mappers/encounter/encounter-write.mapper";

describe("encounter mappers", () => {
  it("maps create input to FHIR Encounter without period.end when endedAt is missing", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
    });

    expect(mapped).toEqual({
      resourceType: "Encounter",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: {
        start: "2026-04-17T10:30:00Z",
      },
    });
  });

  it("maps create input with endedAt to FHIR Encounter period.start/end", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:10:00Z",
    });

    expect(mapped.period).toEqual({
      start: "2026-04-17T10:30:00Z",
      end: "2026-04-17T11:10:00Z",
    });
  });

  it("updates start preserving existing end", () => {
    const mapped = mapEncounterStartDateTimeUpdate(
      {
        resourceType: "Encounter",
        id: "enc-1",
        status: "finished",
        subject: { reference: "Patient/pat-1" },
        episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
        period: {
          start: "2026-04-17T10:30:00Z",
          end: "2026-04-17T11:30:00Z",
        },
      },
      "2026-04-17T10:45:00Z",
    );

    expect(mapped.period).toEqual({
      start: "2026-04-17T10:45:00Z",
      end: "2026-04-17T11:30:00Z",
    });
  });

  it("blocks update when new start is after existing end", () => {
    expect(() =>
      mapEncounterStartDateTimeUpdate(
        {
          resourceType: "Encounter",
          id: "enc-1",
          status: "finished",
          subject: { reference: "Patient/pat-1" },
          episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
          period: {
            start: "2026-04-17T10:30:00Z",
            end: "2026-04-17T11:30:00Z",
          },
        },
        "2026-04-17T11:40:00Z",
      ),
    ).toThrow("No se puede mover el inicio después de la finalización registrada.");
  });

  it("maps legacy FHIR Encounter with start===end without exposing endedAt", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T10:30:00Z" },
    });

    expect(mapped).toEqual({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      status: "finished",
    });
  });

  it("maps fallback startedAt from period.end when start is missing", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { end: "2026-04-17T10:30:00Z" },
    });

    expect(mapped.startedAt).toBe("2026-04-17T10:30:00Z");
    expect(mapped.endedAt).toBeUndefined();
  });

  it("hides endedAt when external data has end before start", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: {
        start: "2026-04-17T11:00:00Z",
        end: "2026-04-17T10:00:00Z",
      },
    });

    expect(mapped.startedAt).toBe("2026-04-17T11:00:00Z");
    expect(mapped.endedAt).toBeUndefined();
  });
});
