import type { Encounter } from "@/domain/encounter/encounter.types";

export interface EncounterStats {
  /**
   * Conteo global de encuentros del paciente (todos los episodios).
   * Las métricas operativas/clínicas restantes de este contrato se calculan
   * sobre el episodio efectivo resuelto por el loader.
   */
  totalCount: number;
  treatmentCount: number;
  lastStartedAt: string | null;
  averageDurationMinutes: number | null;
  totalDurationMinutes: number | null;
  durationEligibleCount: number;
  durationExcludedCount: number;
  isDurationPartial: boolean;
  daysToFirstVisitFromEpisodeStart: number | null;
  isFirstVisitBeforeEpisodeStart: boolean;
  averageDaysBetweenEpisodeVisits: number | null;
  frequencyEligibleVisitCount: number;
  frequencyIntervalCount: number;
  punctualityWithDataCount: number;
  punctualityOnTimeOrMinorDelayCount: number;
  punctualityMissingCount: number;
}

interface EncounterWithTimestamp {
  startedAt: string;
  startedAtTimestamp: number;
}

function toTimestamp(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function isEligibleDuration(encounter: Encounter): boolean {
  const startedAtTimestamp = toTimestamp(encounter.startedAt);
  const endedAtTimestamp = toTimestamp(encounter.endedAt);

  if (startedAtTimestamp === null || endedAtTimestamp === null) {
    return false;
  }

  // Legacy compatibility: start===end means no explicit real duration.
  if (endedAtTimestamp === startedAtTimestamp) {
    return false;
  }

  return endedAtTimestamp > startedAtTimestamp;
}

function getDurationMinutes(encounter: Encounter): number {
  const startedAtTimestamp = new Date(encounter.startedAt).getTime();
  const endedAtTimestamp = new Date(encounter.endedAt as string).getTime();

  return Math.round((endedAtTimestamp - startedAtTimestamp) / 60000);
}

function resolveLastStartedAt(encounters: Encounter[]): string | null {
  let mostRecent: { startedAt: string; timestamp: number } | null = null;

  for (const encounter of encounters) {
    const timestamp = toTimestamp(encounter.startedAt);

    if (timestamp === null) {
      continue;
    }

    if (!mostRecent || timestamp > mostRecent.timestamp) {
      mostRecent = { startedAt: encounter.startedAt, timestamp };
    }
  }

  return mostRecent?.startedAt ?? null;
}

function resolveEpisodeEncounters(params: {
  encounters: Encounter[];
  episodeOfCareId?: string;
}): Encounter[] {
  const { encounters, episodeOfCareId } = params;

  if (!episodeOfCareId) {
    return [];
  }

  return encounters.filter((encounter) => encounter.episodeOfCareId === episodeOfCareId);
}

function resolveSortedEpisodeStartedAtCandidates(encounters: Encounter[]): EncounterWithTimestamp[] {
  const candidates: EncounterWithTimestamp[] = [];

  for (const encounter of encounters) {
    const startedAtTimestamp = toTimestamp(encounter.startedAt);

    if (startedAtTimestamp === null) {
      continue;
    }

    candidates.push({ startedAt: encounter.startedAt, startedAtTimestamp });
  }

  return candidates.sort((a, b) => a.startedAtTimestamp - b.startedAtTimestamp);
}



const MS_PER_DAY = 86400000;

function parseCalendarDayIndex(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const utcTimestamp = Date.UTC(year, monthIndex, day);

  if (Number.isNaN(utcTimestamp)) {
    return null;
  }

  return Math.floor(utcTimestamp / MS_PER_DAY);
}

function resolveDaysToFirstVisitFromEpisodeStart(params: {
  episodeStartDate?: string;
  sortedEpisodeEncounters: EncounterWithTimestamp[];
}): {
  daysToFirstVisitFromEpisodeStart: number | null;
  isFirstVisitBeforeEpisodeStart: boolean;
} {
  const { episodeStartDate, sortedEpisodeEncounters } = params;

  const firstEncounter = sortedEpisodeEncounters[0];

  if (!firstEncounter) {
    return {
      daysToFirstVisitFromEpisodeStart: null,
      isFirstVisitBeforeEpisodeStart: false,
    };
  }

  const episodeStartDayIndex = parseCalendarDayIndex(episodeStartDate);
  const firstVisitDayIndex = parseCalendarDayIndex(firstEncounter.startedAt);

  if (episodeStartDayIndex === null || firstVisitDayIndex === null) {
    return {
      daysToFirstVisitFromEpisodeStart: null,
      isFirstVisitBeforeEpisodeStart: false,
    };
  }

  const calendarDayDifference = firstVisitDayIndex - episodeStartDayIndex;

  return {
    daysToFirstVisitFromEpisodeStart: calendarDayDifference,
    isFirstVisitBeforeEpisodeStart: calendarDayDifference < 0,
  };
}

function resolveAverageDaysBetweenEpisodeVisits(sortedEpisodeEncounters: EncounterWithTimestamp[]): {
  averageDaysBetweenEpisodeVisits: number | null;
  frequencyIntervalCount: number;
} {
  if (sortedEpisodeEncounters.length < 2) {
    return {
      averageDaysBetweenEpisodeVisits: null,
      frequencyIntervalCount: 0,
    };
  }

  let intervalSum = 0;
  let intervalCount = 0;

  for (let index = 1; index < sortedEpisodeEncounters.length; index += 1) {
    const current = sortedEpisodeEncounters[index];
    const previous = sortedEpisodeEncounters[index - 1];
    const intervalDays = (current.startedAtTimestamp - previous.startedAtTimestamp) / 86400000;

    if (intervalDays < 0) {
      continue;
    }

    intervalSum += intervalDays;
    intervalCount += 1;
  }

  return {
    averageDaysBetweenEpisodeVisits: intervalCount > 0 ? intervalSum / intervalCount : null,
    frequencyIntervalCount: intervalCount,
  };
}

export function calculateEncounterStats(params: {
  encounters: Encounter[];
  episodeOfCareId?: string;
  episodeStartDate?: string;
}): EncounterStats {
  const { encounters, episodeOfCareId, episodeStartDate } = params;

  const episodeEncounters = resolveEpisodeEncounters({ encounters, episodeOfCareId });
  const treatmentCount = episodeEncounters.length;

  const durationEligibleEncounters = episodeEncounters.filter(isEligibleDuration);
  const durationEligibleCount = durationEligibleEncounters.length;
  const durationExcludedCount = treatmentCount - durationEligibleCount;

  const totalDurationMinutes = durationEligibleCount > 0
    ? durationEligibleEncounters.reduce((total, encounter) => total + getDurationMinutes(encounter), 0)
    : null;

  const sortedEpisodeEncounterCandidates = resolveSortedEpisodeStartedAtCandidates(episodeEncounters);
  const firstVisitFromEpisodeStart = resolveDaysToFirstVisitFromEpisodeStart({
    episodeStartDate,
    sortedEpisodeEncounters: sortedEpisodeEncounterCandidates,
  });
  const frequencyStats = resolveAverageDaysBetweenEpisodeVisits(sortedEpisodeEncounterCandidates);
  const punctualityWithDataCount = episodeEncounters.filter((encounter) => Boolean(encounter.visitStartPunctuality)).length;
  const punctualityOnTimeOrMinorDelayCount = episodeEncounters.filter(
    (encounter) => encounter.visitStartPunctuality === "on_time_or_minor_delay",
  ).length;
  const punctualityMissingCount = treatmentCount - punctualityWithDataCount;

  return {
    totalCount: encounters.length,
    treatmentCount,
    lastStartedAt: resolveLastStartedAt(episodeEncounters),
    averageDurationMinutes: totalDurationMinutes !== null
      ? Math.round(totalDurationMinutes / durationEligibleCount)
      : null,
    totalDurationMinutes,
    durationEligibleCount,
    durationExcludedCount,
    isDurationPartial: durationEligibleCount > 0 && durationExcludedCount > 0,
    daysToFirstVisitFromEpisodeStart: firstVisitFromEpisodeStart.daysToFirstVisitFromEpisodeStart,
    isFirstVisitBeforeEpisodeStart: firstVisitFromEpisodeStart.isFirstVisitBeforeEpisodeStart,
    averageDaysBetweenEpisodeVisits: frequencyStats.averageDaysBetweenEpisodeVisits,
    frequencyEligibleVisitCount: sortedEpisodeEncounterCandidates.length,
    frequencyIntervalCount: frequencyStats.frequencyIntervalCount,
    punctualityWithDataCount,
    punctualityOnTimeOrMinorDelayCount,
    punctualityMissingCount,
  };
}
