"use server";

import { revalidatePath } from "next/cache";

import { canCreateEncounter, canUseEncounterTimeRangeWithinEpisode } from "@/domain/encounter/encounter.rules";
import { createEncounterSchema } from "@/domain/encounter/encounter.schemas";
import { createEncounter } from "@/infrastructure/repositories/encounter.repository";
import { getActiveEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";
import { createFunctionalObservation } from "@/infrastructure/repositories/observation.repository";

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

    const now = new Date();

    const timeRangeValidation = canUseEncounterTimeRangeWithinEpisode({
      startedAt: parsedInput.startedAt,
      endedAt: parsedInput.endedAt,
      episodeStartDate: activeEpisode.startDate,
      episodeEndDate: activeEpisode.endDate,
      now,
    });

    if (!timeRangeValidation.ok) {
      return {
        ok: false,
        message: timeRangeValidation.message,
      };
    }

    const createdEncounter = await createEncounter(parsedInput);
    const functionalObservations = parsedInput.functionalObservations ?? [];

    try {
      await Promise.all(functionalObservations.map((observation) => createFunctionalObservation({
        ...observation,
        patientId: parsedInput.patientId,
        encounterId: createdEncounter.id,
        effectiveDateTime: parsedInput.startedAt,
      })));
    } catch {
      return {
        ok: false,
        message: "La visita se registró, pero falló la carga de métricas funcionales. Reintentá cargar métricas en una nueva visita o contactar soporte.",
      };
    }
    revalidatePath(`/admin/patients/${parsedInput.patientId}/encounters`);

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
