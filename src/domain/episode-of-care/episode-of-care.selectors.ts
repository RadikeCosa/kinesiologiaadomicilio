import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";

export interface PatientEpisodesSelection {
  activeEpisode: EpisodeOfCare | null;
  activeEpisodesCount: number;
  closedEpisodes: EpisodeOfCare[];
  effectiveEpisode: EpisodeOfCare | null;
  hasMultipleActiveEpisodes: boolean;
  mostRecentEpisode: EpisodeOfCare | null;
}

function toSafeTimestamp(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function selectMostRecentByStartDate(episodes: EpisodeOfCare[]): EpisodeOfCare | null {
  if (!episodes.length) {
    return null;
  }

  return episodes.reduce((latest, current) => {
    const latestTimestamp = toSafeTimestamp(latest.startDate);
    const currentTimestamp = toSafeTimestamp(current.startDate);

    if (latestTimestamp === null && currentTimestamp === null) {
      return latest;
    }

    if (latestTimestamp === null) {
      return current;
    }

    if (currentTimestamp === null) {
      return latest;
    }

    if (currentTimestamp === latestTimestamp) {
      return latest;
    }

    return currentTimestamp > latestTimestamp ? current : latest;
  });
}

export function selectPatientEpisodes(episodes: EpisodeOfCare[]): PatientEpisodesSelection {
  const activeEpisodes = episodes.filter((episode) => episode.status === "active");
  const activeEpisode = selectMostRecentByStartDate(activeEpisodes);
  const mostRecentEpisode = selectMostRecentByStartDate(episodes);

  return {
    activeEpisode,
    activeEpisodesCount: activeEpisodes.length,
    closedEpisodes: episodes.filter((episode) => episode.status === "finished"),
    effectiveEpisode: activeEpisode ?? mostRecentEpisode,
    hasMultipleActiveEpisodes: activeEpisodes.length > 1,
    mostRecentEpisode,
  };
}
