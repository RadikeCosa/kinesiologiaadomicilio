import { describe, expect, it } from "vitest";

import { selectPatientEpisodes } from "@/domain/episode-of-care/episode-of-care.selectors";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";

function buildEpisode(overrides: Partial<EpisodeOfCare> & Pick<EpisodeOfCare, "id" | "status" | "startDate">): EpisodeOfCare {
  return {
    patientId: "pat-1",
    ...overrides,
  };
}

describe("selectPatientEpisodes", () => {
  it("returns null selections for a patient without episodes", () => {
    expect(selectPatientEpisodes([])).toEqual({
      activeEpisode: null,
      activeEpisodesCount: 0,
      closedEpisodes: [],
      effectiveEpisode: null,
      hasMultipleActiveEpisodes: false,
      mostRecentEpisode: null,
    });
  });

  it("selects a single active episode as active, most recent and effective", () => {
    const activeEpisode = buildEpisode({
      id: "episode-active",
      status: "active",
      startDate: "2026-05-01",
    });

    expect(selectPatientEpisodes([activeEpisode])).toEqual({
      activeEpisode,
      activeEpisodesCount: 1,
      closedEpisodes: [],
      effectiveEpisode: activeEpisode,
      hasMultipleActiveEpisodes: false,
      mostRecentEpisode: activeEpisode,
    });
  });

  it("uses a finished episode as effective fallback when there is no active episode", () => {
    const closedEpisodeOld = buildEpisode({
      id: "episode-closed-old",
      status: "finished",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });

    const selection = selectPatientEpisodes([closedEpisodeOld]);

    expect(selection.activeEpisode).toBeNull();
    expect(selection.closedEpisodes).toEqual([closedEpisodeOld]);
    expect(selection.mostRecentEpisode).toBe(closedEpisodeOld);
    expect(selection.effectiveEpisode).toBe(closedEpisodeOld);
  });

  it("selects the most recent finished episode when several closed cycles exist", () => {
    const closedEpisodeOld = buildEpisode({
      id: "episode-closed-old",
      status: "finished",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
    const closedEpisodeRecent = buildEpisode({
      id: "episode-closed-recent",
      status: "finished",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
    });

    const selection = selectPatientEpisodes([closedEpisodeOld, closedEpisodeRecent]);

    expect(selection.activeEpisode).toBeNull();
    expect(selection.closedEpisodes).toEqual([closedEpisodeOld, closedEpisodeRecent]);
    expect(selection.mostRecentEpisode).toBe(closedEpisodeRecent);
    expect(selection.effectiveEpisode).toBe(closedEpisodeRecent);
  });

  it("keeps active episode as effective even when finished episodes also exist", () => {
    const closedEpisodeOld = buildEpisode({
      id: "episode-closed-old",
      status: "finished",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
    const closedEpisodeRecent = buildEpisode({
      id: "episode-closed-recent",
      status: "finished",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
    });
    const activeEpisode = buildEpisode({
      id: "episode-active",
      status: "active",
      startDate: "2026-02-01",
    });

    const selection = selectPatientEpisodes([closedEpisodeOld, closedEpisodeRecent, activeEpisode]);

    expect(selection.activeEpisode).toBe(activeEpisode);
    expect(selection.closedEpisodes).toEqual([closedEpisodeOld, closedEpisodeRecent]);
    expect(selection.mostRecentEpisode).toBe(closedEpisodeRecent);
    expect(selection.effectiveEpisode).toBe(activeEpisode);
    expect(selection.hasMultipleActiveEpisodes).toBe(false);
  });

  it("exposes multiple active episodes and chooses the active with latest valid start date", () => {
    const activeEpisodeOld = buildEpisode({
      id: "episode-active-old",
      status: "active",
      startDate: "2026-04-01",
    });
    const activeEpisodeRecent = buildEpisode({
      id: "episode-active-recent",
      status: "active",
      startDate: "2026-05-01",
    });

    const selection = selectPatientEpisodes([activeEpisodeOld, activeEpisodeRecent]);

    expect(selection.activeEpisodesCount).toBe(2);
    expect(selection.hasMultipleActiveEpisodes).toBe(true);
    expect(selection.activeEpisode).toBe(activeEpisodeRecent);
    expect(selection.effectiveEpisode).toBe(activeEpisodeRecent);
  });

  it("handles invalid or absent dates defensively and keeps deterministic ties", () => {
    const closedEpisodeInvalid = buildEpisode({
      id: "episode-closed-invalid",
      status: "finished",
      startDate: "not-a-date",
    });
    const activeEpisodeInvalid = buildEpisode({
      id: "episode-active-invalid",
      status: "active",
      startDate: "",
    });
    const activeEpisodeValid = buildEpisode({
      id: "episode-active-valid",
      status: "active",
      startDate: "2026-05-01",
    });
    const activeEpisodeSameDate = buildEpisode({
      id: "episode-active-same-date",
      status: "active",
      startDate: "2026-05-01",
    });

    const selection = selectPatientEpisodes([
      closedEpisodeInvalid,
      activeEpisodeInvalid,
      activeEpisodeValid,
      activeEpisodeSameDate,
    ]);

    expect(selection.mostRecentEpisode).toBe(activeEpisodeValid);
    expect(selection.activeEpisode).toBe(activeEpisodeValid);
    expect(selection.effectiveEpisode).toBe(activeEpisodeValid);
    expect(selection.hasMultipleActiveEpisodes).toBe(true);
  });
});
