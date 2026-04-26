export type CreateEncounterFailureReason = "missing_active_episode";

export type CreateEncounterRuleResult =
  | { ok: true }
  | {
      ok: false;
      reason: CreateEncounterFailureReason;
      message: string;
    };

export function canCreateEncounter(options: { hasActiveEpisode: boolean }): CreateEncounterRuleResult {
  if (!options.hasActiveEpisode) {
    return {
      ok: false,
      reason: "missing_active_episode",
      message: "No se puede registrar visita sin un tratamiento activo.",
    };
  }

  return { ok: true };
}

export type EncounterTimeRangeFailureReason =
  | "before_episode_start"
  | "after_episode_end"
  | "future_datetime";

export type EncounterTimeRangeRuleResult =
  | { ok: true }
  | {
      ok: false;
      reason: EncounterTimeRangeFailureReason;
      message: string;
    };

function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

function buildEpisodeStartDateTime(startDate: string): string {
  return `${startDate}T00:00:00`;
}

function buildEpisodeEndDateTime(endDate: string): string {
  return `${endDate}T23:59:59`;
}

export function canUseEncounterTimeRangeWithinEpisode(params: {
  startedAt: string;
  endedAt: string;
  episodeStartDate: string;
  episodeEndDate?: string;
  now?: Date;
}): EncounterTimeRangeRuleResult {
  const nowTimestamp = (params.now ?? new Date()).getTime();
  const startedAtTimestamp = toTimestamp(params.startedAt);
  const endedAtTimestamp = toTimestamp(params.endedAt);
  const episodeStartTimestamp = toTimestamp(buildEpisodeStartDateTime(params.episodeStartDate));

  if (startedAtTimestamp > nowTimestamp || endedAtTimestamp > nowTimestamp) {
    return {
      ok: false,
      reason: "future_datetime",
      message: "La visita no puede registrarse en una fecha futura.",
    };
  }

  if (startedAtTimestamp < episodeStartTimestamp) {
    return {
      ok: false,
      reason: "before_episode_start",
      message: "El inicio de la visita no puede ser anterior al inicio del tratamiento.",
    };
  }

  if (params.episodeEndDate) {
    const episodeEndTimestamp = toTimestamp(buildEpisodeEndDateTime(params.episodeEndDate));

    if (startedAtTimestamp > episodeEndTimestamp || endedAtTimestamp > episodeEndTimestamp) {
      return {
        ok: false,
        reason: "after_episode_end",
        message: "La visita no puede ser posterior al cierre del tratamiento.",
      };
    }
  }

  return { ok: true };
}
