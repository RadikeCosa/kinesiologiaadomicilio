"use server";

import { canCreateEncounter } from "@/domain/encounter/encounter.rules";
import { createEncounterSchema } from "@/domain/encounter/encounter.schemas";
import { createEncounter } from "@/infrastructure/repositories/encounter.repository";
import { getActiveEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";

export interface CreateEncounterActionResult {
  ok: boolean;
  message?: string;
}

export async function createEncounterAction(input: unknown): Promise<CreateEncounterActionResult> {
  try {
    const parsedInput = createEncounterSchema.parse(input);
    const activeEpisode = await getActiveEpisodeByPatientId(parsedInput.patientId);
    const createValidation = canCreateEncounter({
      hasActiveEpisode: Boolean(activeEpisode),
    });

    if (!createValidation.ok) {
      return {
        ok: false,
        message: createValidation.message,
      };
    }

    if (!activeEpisode?.id || activeEpisode.id !== parsedInput.episodeOfCareId) {
      return {
        ok: false,
        message: "El tratamiento activo cambió. Reintentá desde la pantalla actualizada.",
      };
    }

    await createEncounter(parsedInput);

    return {
      ok: true,
      message: "Visita registrada correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar la visita.";

    return {
      ok: false,
      message,
    };
  }
}
