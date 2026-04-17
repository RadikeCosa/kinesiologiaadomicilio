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
