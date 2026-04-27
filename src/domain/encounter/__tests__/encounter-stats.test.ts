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
    expect(calculateEncounterStats({ encounters: [], episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" })).toEqual({
      totalCount: 0,
      treatmentCount: 0,
      lastStartedAt: null,
      averageDurationMinutes: null,
      totalDurationMinutes: null,
      durationEligibleCount: 0,
      durationExcludedCount: 0,
      isDurationPartial: false,
      daysToFirstVisitFromEpisodeStart: null,
      isFirstVisitBeforeEpisodeStart: false,
      averageDaysBetweenEpisodeVisits: null,
      frequencyEligibleVisitCount: 0,
      frequencyIntervalCount: 0,
    });
  });

  it("keeps totalCount global but scopes all operational metrics to effective episode", () => {
    const encounters = [
      createEncounter({
        id: "enc-episode",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T10:00:00Z",
        endedAt: "2026-04-01T10:40:00Z",
      }),
      createEncounter({
        id: "enc-other",
        episodeOfCareId: "epi-2",
        startedAt: "2026-04-02T10:00:00Z",
        endedAt: "2026-04-02T12:00:00Z",
      }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });

    expect(result.totalCount).toBe(2);
    expect(result.treatmentCount).toBe(1);
    expect(result.lastStartedAt).toBe("2026-04-01T10:00:00Z");
    expect(result.totalDurationMinutes).toBe(40);
    expect(result.averageDurationMinutes).toBe(40);
    expect(result.durationEligibleCount).toBe(1);
    expect(result.durationExcludedCount).toBe(0);
  });

  it("calculates duration only with encounters in effective episode", () => {
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
      createEncounter({
        id: "enc-3",
        episodeOfCareId: "epi-2",
        startedAt: "2026-04-02T10:00:00Z",
        endedAt: "2026-04-02T15:00:00Z",
      }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });

    expect(result.totalDurationMinutes).toBe(95);
    expect(result.averageDurationMinutes).toBe(48);
    expect(result.durationEligibleCount).toBe(2);
    expect(result.durationExcludedCount).toBe(0);
  });

  it("counts duration exclusions only inside the effective episode", () => {
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
      createEncounter({
        id: "enc-3",
        episodeOfCareId: "epi-2",
        startedAt: "2026-04-03T10:00:00Z",
      }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });

    expect(result.treatmentCount).toBe(2);
    expect(result.durationEligibleCount).toBe(1);
    expect(result.durationExcludedCount).toBe(1);
    expect(result.isDurationPartial).toBe(true);
  });

  it("returns non-calculable duration metrics when there is no effective episode", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T10:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters });

    expect(result.treatmentCount).toBe(0);
    expect(result.lastStartedAt).toBeNull();
    expect(result.totalDurationMinutes).toBeNull();
    expect(result.averageDurationMinutes).toBeNull();
    expect(result.durationEligibleCount).toBe(0);
    expect(result.durationExcludedCount).toBe(0);
    expect(result.daysToFirstVisitFromEpisodeStart).toBeNull();
    expect(result.averageDaysBetweenEpisodeVisits).toBeNull();
  });

  it("handles episode with only invalid durations as null duration + scoped exclusions", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-01T10:00:00Z",
        endedAt: "2026-04-01T10:00:00Z",
      }),
      createEncounter({
        id: "enc-2",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-02T11:00:00Z",
        endedAt: "2026-04-02T10:00:00Z",
      }),
    ];

    expect(calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" })).toMatchObject({
      treatmentCount: 2,
      averageDurationMinutes: null,
      totalDurationMinutes: null,
      durationEligibleCount: 0,
      durationExcludedCount: 2,
      isDurationPartial: false,
    });
  });

  it("filters treatmentCount by episodeOfCareId", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T10:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-2", startedAt: "2026-04-02T10:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-2", episodeStartDate: "2026-04-01" });

    expect(result.totalCount).toBe(2);
    expect(result.treatmentCount).toBe(1);
  });

  it("keeps lastStartedAt null when all startedAt values are invalid in the episode", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "invalid-date" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-2", startedAt: "2026-04-02T10:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });
    expect(result.lastStartedAt).toBeNull();
  });

  it("with one valid visit calculates first-visit metric and keeps frequency not calculable", () => {
    const encounters = [
      createEncounter({
        id: "enc-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-03T06:00:00Z",
      }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });

    expect(result.daysToFirstVisitFromEpisodeStart).toBe(2.25);
    expect(result.isFirstVisitBeforeEpisodeStart).toBe(false);
    expect(result.averageDaysBetweenEpisodeVisits).toBeNull();
    expect(result.frequencyEligibleVisitCount).toBe(1);
    expect(result.frequencyIntervalCount).toBe(0);
  });

  it("calculates frequency from two visits as the single interval", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T00:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-1", startedAt: "2026-04-04T00:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });

    expect(result.averageDaysBetweenEpisodeVisits).toBe(3);
    expect(result.frequencyIntervalCount).toBe(1);
  });

  it("computes rounded-average-ready raw value for irregular intervals", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T00:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-1", startedAt: "2026-04-02T00:00:00Z" }),
      createEncounter({ id: "enc-3", episodeOfCareId: "epi-1", startedAt: "2026-04-05T00:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });
    expect(result.averageDaysBetweenEpisodeVisits).toBe(2);
  });

  it("keeps sub-day interval averages for UI to map into 'Menos de 1 día'", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T10:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-1", startedAt: "2026-04-01T18:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });
    expect(result.averageDaysBetweenEpisodeVisits).toBeCloseTo(1 / 3, 5);
  });

  it("supports same-day duplicate timestamps as zero-day intervals", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T10:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-1", startedAt: "2026-04-01T10:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });
    expect(result.averageDaysBetweenEpisodeVisits).toBe(0);
  });

  it("flags first visit before episode start without breaking frequency", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-03-30T00:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-1", startedAt: "2026-04-02T00:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });
    expect(result.daysToFirstVisitFromEpisodeStart).toBe(-2);
    expect(result.isFirstVisitBeforeEpisodeStart).toBe(true);
    expect(result.averageDaysBetweenEpisodeVisits).toBe(3);
  });

  it("ignores invalid startedAt values for first-visit and frequency metrics", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "invalid-date" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-1", startedAt: "2026-04-02T00:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });
    expect(result.frequencyEligibleVisitCount).toBe(1);
    expect(result.daysToFirstVisitFromEpisodeStart).toBe(1);
    expect(result.averageDaysBetweenEpisodeVisits).toBeNull();
  });

  it("excludes visits outside the effective episode from rhythm metrics", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T00:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-2", startedAt: "2026-04-02T00:00:00Z" }),
      createEncounter({ id: "enc-3", episodeOfCareId: "epi-1", startedAt: "2026-04-04T00:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1", episodeStartDate: "2026-04-01" });
    expect(result.frequencyEligibleVisitCount).toBe(2);
    expect(result.averageDaysBetweenEpisodeVisits).toBe(3);
  });

  it("allows frequency calculation when episode has no startDate", () => {
    const encounters = [
      createEncounter({ id: "enc-1", episodeOfCareId: "epi-1", startedAt: "2026-04-01T00:00:00Z" }),
      createEncounter({ id: "enc-2", episodeOfCareId: "epi-1", startedAt: "2026-04-03T00:00:00Z" }),
    ];

    const result = calculateEncounterStats({ encounters, episodeOfCareId: "epi-1" });
    expect(result.daysToFirstVisitFromEpisodeStart).toBeNull();
    expect(result.isFirstVisitBeforeEpisodeStart).toBe(false);
    expect(result.averageDaysBetweenEpisodeVisits).toBe(2);
  });
});
