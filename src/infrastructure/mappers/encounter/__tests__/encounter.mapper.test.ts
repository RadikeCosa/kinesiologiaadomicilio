import { describe, expect, it } from "vitest";

import { mapFhirEncounterToDomain } from "@/infrastructure/mappers/encounter/encounter-read.mapper";
import {
  mapCreateEncounterInputToFhir,
  mapEncounterOccurrenceDateTimeUpdate,
} from "@/infrastructure/mappers/encounter/encounter-write.mapper";

describe("encounter mappers", () => {
  it("maps create input to FHIR Encounter with period.start/end and finished status", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-17T10:30:00Z",
    });

    expect(mapped).toEqual({
      resourceType: "Encounter",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: {
        start: "2026-04-17T10:30:00Z",
        end: "2026-04-17T10:30:00Z",
      },
    });
  });

  it("maps occurrence date-time update keeping base Encounter consistency", () => {
    const mapped = mapEncounterOccurrenceDateTimeUpdate(
      {
        resourceType: "Encounter",
        id: "enc-1",
        status: "finished",
        subject: { reference: "Patient/pat-1" },
        episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
        period: {
          start: "2026-04-17T10:30:00Z",
          end: "2026-04-17T10:30:00Z",
        },
      },
      "2026-04-18T11:15:00Z",
    );

    expect(mapped.period).toEqual({
      start: "2026-04-18T11:15:00Z",
      end: "2026-04-18T11:15:00Z",
    });
  });

  it("maps FHIR Encounter to domain", () => {
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
      occurrenceDate: "2026-04-17T10:30:00Z",
      status: "finished",
    });
  });
});
