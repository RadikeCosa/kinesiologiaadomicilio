import { describe, expect, it } from "vitest";

import { canUseEncounterTimeRangeWithinEpisode } from "@/domain/encounter/encounter.rules";

describe("encounter.rules", () => {
  it("fails when visit starts before treatment start", () => {
    const result = canUseEncounterTimeRangeWithinEpisode({
      startedAt: "2026-04-17T09:00:00Z",
      endedAt: "2026-04-17T10:00:00Z",
      episodeStartDate: "2026-04-18",
      now: new Date("2026-04-20T12:00:00Z"),
    });

    expect(result).toEqual({
      ok: false,
      reason: "before_episode_start",
      message: "El inicio de la visita no puede ser anterior al inicio del tratamiento.",
    });
  });

  it("fails when visit is in the future", () => {
    const result = canUseEncounterTimeRangeWithinEpisode({
      startedAt: "2026-04-21T09:00:00Z",
      endedAt: "2026-04-21T10:00:00Z",
      episodeStartDate: "2026-04-18",
      now: new Date("2026-04-20T12:00:00Z"),
    });

    expect(result).toEqual({
      ok: false,
      reason: "future_datetime",
      message: "La visita no puede registrarse en una fecha futura.",
    });
  });

  it("fails when visit is after treatment end", () => {
    const result = canUseEncounterTimeRangeWithinEpisode({
      startedAt: "2026-04-20T09:00:00Z",
      endedAt: "2026-04-20T10:00:00Z",
      episodeStartDate: "2026-04-01",
      episodeEndDate: "2026-04-19",
      now: new Date("2026-04-21T12:00:00Z"),
    });

    expect(result).toEqual({
      ok: false,
      reason: "after_episode_end",
      message: "La visita no puede ser posterior al cierre del tratamiento.",
    });
  });

  it("passes when time range is within treatment range and not future", () => {
    const result = canUseEncounterTimeRangeWithinEpisode({
      startedAt: "2026-04-19T09:00:00Z",
      endedAt: "2026-04-19T10:00:00Z",
      episodeStartDate: "2026-04-01",
      episodeEndDate: "2026-04-19",
      now: new Date("2026-04-21T12:00:00Z"),
    });

    expect(result).toEqual({ ok: true });
  });

  it("accepts endedAt at inclusive episode end-of-day boundary", () => {
    const result = canUseEncounterTimeRangeWithinEpisode({
      startedAt: "2026-04-20T22:00:00",
      endedAt: "2026-04-20T23:59:59",
      episodeStartDate: "2026-04-01",
      episodeEndDate: "2026-04-20",
      now: new Date("2026-04-21T12:00:00Z"),
    });

    expect(result).toEqual({ ok: true });
  });

  it("rejects endedAt after inclusive episode end-of-day boundary", () => {
    const result = canUseEncounterTimeRangeWithinEpisode({
      startedAt: "2026-04-20T23:30:00",
      endedAt: "2026-04-21T00:00:00",
      episodeStartDate: "2026-04-01",
      episodeEndDate: "2026-04-20",
      now: new Date("2026-04-21T12:00:00Z"),
    });

    expect(result).toEqual({
      ok: false,
      reason: "after_episode_end",
      message: "La visita no puede ser posterior al cierre del tratamiento.",
    });
  });
});
