"use server";

import { canFinishEpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.rules";
import { finishEpisodeOfCareSchema } from "@/domain/episode-of-care/episode-of-care.schemas";
import { finishActiveEpisodeOfCare, getActiveEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";

export interface FinishEpisodeOfCareActionResult {
  ok: boolean;
  message?: string;
}

export async function finishEpisodeOfCareAction(
  input: unknown,
): Promise<FinishEpisodeOfCareActionResult> {
  try {
    const parsedInput = finishEpisodeOfCareSchema.parse(input);
    const activeEpisode = await getActiveEpisodeByPatientId(parsedInput.patientId);
    const finishValidation = canFinishEpisodeOfCare({
      hasActiveEpisode: Boolean(activeEpisode),
    });

    if (!finishValidation.ok) {
      return {
        ok: false,
        message: finishValidation.message,
      };
    }

    const finished = await finishActiveEpisodeOfCare(parsedInput);

    if (!finished) {
      return {
        ok: false,
        message: "No se pudo finalizar el tratamiento activo.",
      };
    }

    return {
      ok: true,
      message: "Tratamiento finalizado correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo finalizar el tratamiento.";

    return {
      ok: false,
      message,
    };
  }
}
