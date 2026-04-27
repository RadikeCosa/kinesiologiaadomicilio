import type { Encounter } from "@/domain/encounter/encounter.types";

export interface EncounterStats {
  totalCount: number;
  treatmentCount: number;
  lastStartedAt: string | null;
  averageDurationMinutes: number | null;
  totalDurationMinutes: number | null;
  durationEligibleCount: number;
  durationExcludedCount: number;
  isDurationPartial: boolean;
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

export function calculateEncounterStats(params: {
  encounters: Encounter[];
  episodeOfCareId?: string;
}): EncounterStats {
  const { encounters, episodeOfCareId } = params;

  const treatmentCount = episodeOfCareId
    ? encounters.filter((encounter) => encounter.episodeOfCareId === episodeOfCareId).length
    : 0;

  const durationEligibleEncounters = encounters.filter(isEligibleDuration);
  const durationEligibleCount = durationEligibleEncounters.length;
  const durationExcludedCount = encounters.length - durationEligibleCount;

  const totalDurationMinutes = durationEligibleCount > 0
    ? durationEligibleEncounters.reduce((total, encounter) => total + getDurationMinutes(encounter), 0)
    : null;

  return {
    totalCount: encounters.length,
    treatmentCount,
    lastStartedAt: resolveLastStartedAt(encounters),
    averageDurationMinutes: totalDurationMinutes !== null
      ? Math.round(totalDurationMinutes / durationEligibleCount)
      : null,
    totalDurationMinutes,
    durationEligibleCount,
    durationExcludedCount,
    isDurationPartial: durationEligibleCount > 0 && durationExcludedCount > 0,
  };
}
