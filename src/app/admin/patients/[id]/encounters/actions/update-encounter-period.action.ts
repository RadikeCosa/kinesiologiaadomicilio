"use server";

import { revalidatePath } from "next/cache";

import { updateEncounterPeriodSchema } from "@/domain/encounter/encounter.schemas";
import { canUseEncounterTimeRangeWithinEpisode } from "@/domain/encounter/encounter.rules";
import {
  getEncounterById,
  updateEncounterTimeRange,
} from "@/infrastructure/repositories/encounter.repository";
import { getEpisodeById } from "@/infrastructure/repositories/episode-of-care.repository";

export interface UpdateEncounterPeriodActionResult {
  ok: boolean;
  message?: string;
}

export async function updateEncounterPeriodAction(
  input: unknown,
): Promise<UpdateEncounterPeriodActionResult> {
  try {
    const parsedInput = updateEncounterPeriodSchema.parse(input);
    const encounter = await getEncounterById(parsedInput.encounterId);

    if (!encounter) {
      return {
        ok: false,
        message: "No se encontró la visita seleccionada.",
      };
    }

    if (encounter.patientId !== parsedInput.patientId) {
      return {
        ok: false,
        message: "La visita no corresponde al paciente actual.",
      };
    }

    const episode = await getEpisodeById(encounter.episodeOfCareId);

    if (!episode || episode.patientId !== parsedInput.patientId) {
      return {
        ok: false,
        message: "No se encontró el tratamiento asociado a la visita.",
      };
    }

    const now = new Date();

    const timeRangeValidation = canUseEncounterTimeRangeWithinEpisode({
      startedAt: parsedInput.startedAt,
      endedAt: parsedInput.endedAt,
      episodeStartDate: episode.startDate,
      episodeEndDate: episode.endDate,
      now,
    });

    if (!timeRangeValidation.ok) {
      return {
        ok: false,
        message: timeRangeValidation.message,
      };
    }

    await updateEncounterTimeRange(parsedInput);

    revalidatePath(`/admin/patients/${parsedInput.patientId}/encounters`);

    return {
      ok: true,
      message: "Inicio y cierre de la visita actualizados correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la visita.";

    return {
      ok: false,
      message,
    };
  }
}
