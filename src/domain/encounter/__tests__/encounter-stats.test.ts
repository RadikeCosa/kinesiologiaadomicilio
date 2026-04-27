import { describe, expect, it } from "vitest";

import { calculateEncounterStats } from "@/domain/encounter/encounter-stats";
import type { Encounter } from "@/domain/encounter/encounter.types";

function createEncounter(input: Partial<Encounter> & Pick<Encounter, "id" | "startedAt" | "episodeOfCareId">): Encounter {
  return {
    id: input.id,
    patientId: input.patientId ?? "pat-1",
    episodeOfCareId: input.episodeOfCareId,
    startedAt: input.startedAt,
    ...(input.endedAt ? { endedAt: input.endedAt } : {}),
    status: "finished",
  };
}

describe("calculateEncounterStats", () => {
  it("returns zeroed stats when there are no encounters", () => {
    expect(calculateEncounterStats({ encounters: [], episodeOfCareId: "epi-1" })).toEqual({
      totalCount: 0,
      treatmentCount: 0,
      lastStartedAt: null,
      averageDurationMinutes: null,
      totalDurationMinutes: null,
      durationEligibleCount: 0,
      durationExcludedCount: 0,
      isDurationPartial: false,
    });
  });

  it("calculates total/average duration when all encounters have explicit valid duration", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T10:00:00Z",
        endedAt: "2026-04-01T10:40:00Z",
      }),
      createEncounter({
        id: "enc-2",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-02T10:00:00Z",
        endedAt: "2026-04-02T10:20:00Z",
      }),
    ];

    expect(calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" })).toEqual({
      totalCount: 2,
      treatmentCount: 2,
      lastStartedAt: "2026-04-02T10:00:00Z",
      averageDurationMinutes: 30,
      totalDurationMinutes: 60,
      durationEligibleCount: 2,
      durationExcludedCount: 0,
      isDurationPartial: false,
    });
  });

  it("excludes encounters without endedAt from duration metrics", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T10:00:00Z",
        endedAt: "2026-04-01T10:40:00Z",
      }),
      createEncounter({
        id: "enc-2",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-02T10:00:00Z",
      }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" });

    expect(result.totalDurationMinutes).toBe(40);
    expect(result.averageDurationMinutes).toBe(40);
    expect(result.durationEligibleCount).toBe(1);
    expect(result.durationExcludedCount).toBe(1);
    expect(result.isDurationPartial).toBe(true);
  });

  it("excludes legacy encounters with startedAt===endedAt", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T10:00:00Z",
        endedAt: "2026-04-01T10:00:00Z",
      }),
    ];

    expect(calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" })).toMatchObject({
      averageDurationMinutes: null,
      totalDurationMinutes: null,
      durationEligibleCount: 0,
      durationExcludedCount: 1,
      isDurationPartial: false,
    });
  });

  it("excludes invalid durations where endedAt < startedAt", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T11:00:00Z",
        endedAt: "2026-04-01T10:00:00Z",
      }),
    ];

    expect(calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" })).toMatchObject({
      averageDurationMinutes: null,
      totalDurationMinutes: null,
      durationEligibleCount: 0,
      durationExcludedCount: 1,
    });
  });


  it("excludes encounter when endedAt is invalid", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T11:00:00Z",
        endedAt: "invalid-date",
      }),
    ];

    expect(calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" })).toMatchObject({
      averageDurationMinutes: null,
      totalDurationMinutes: null,
      durationEligibleCount: 0,
      durationExcludedCount: 1,
    });
  });

  it("rounds average duration using Math.round", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T10:00:00Z",
        endedAt: "2026-04-01T10:35:00Z",
      }),
      createEncounter({
        id: "enc-2",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-02T10:00:00Z",
        endedAt: "2026-04-02T11:00:00Z",
      }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" });

    expect(result.totalDurationMinutes).toBe(95);
    expect(result.averageDurationMinutes).toBe(48);
  });

  it("filters treatmentCount by episodeOfCareId", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T10:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-2", startedAt: "2026-04-02T10:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-2" });

    expect(result.totalCount).toBe(2);
    expect(result.treatmentCount).toBe(1);
  });

  it("uses treatment count 0 when there is no episode in context", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T10:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters });
    expect(result.treatmentCount).toBe(0);
  });

  it("keeps lastStartedAt null when all startedAt values are invalid", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "invalid-date" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" });
    expect(result.lastStartedAt).toBeNull();
  });
});
