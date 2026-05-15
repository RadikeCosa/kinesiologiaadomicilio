"use server";

import { revalidatePath } from "next/cache";

import { canCreateEncounter, canUseEncounterTimeRangeWithinEpisode } from "@/domain/encounter/encounter.rules";
import { createEncounterSchema } from "@/domain/encounter/encounter.schemas";
import type { FunctionalObservationCode } from "@/domain/functional-observation/functional-observation.types";
import { createEncounter } from "@/infrastructure/repositories/encounter.repository";
import { getActiveEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";
import { createFunctionalObservation } from "@/infrastructure/repositories/observation.repository";

export interface CreateEncounterActionResult {
  ok: boolean;
  partial?: boolean;
  message?: string;
  failedObservationCodes?: string[];
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

    if (functionalObservations.length > 0) {
      const observationCreationResults = await Promise.allSettled(
        functionalObservations.map((observation) => createFunctionalObservation({
          ...observation,
          patientId: parsedInput.patientId,
          encounterId: createdEncounter.id,
          effectiveDateTime: parsedInput.startedAt,
        })),
      );

      const failedObservationCodes = observationCreationResults
        .map((result, index) => (result.status === "rejected" ? functionalObservations[index]?.code ?? null : null))
        .filter((code): code is FunctionalObservationCode => code !== null);

      if (failedObservationCodes.length > 0) {
        console.error("createEncounterAction partial functional observation failure", {
          patientId: parsedInput.patientId,
          encounterId: createdEncounter.id,
          failedObservationCodes,
        });

        revalidatePath(`/admin/patients/${parsedInput.patientId}/encounters`);
        return {
          ok: true,
          partial: true,
          message: "La visita se registró, pero algunas métricas funcionales no pudieron guardarse.",
          failedObservationCodes,
        };
      }
    }

    revalidatePath(`/admin/patients/${parsedInput.patientId}/encounters`);

    return {
      ok: true,
      partial: false,
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
