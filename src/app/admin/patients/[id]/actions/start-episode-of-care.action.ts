"use server";

import { canStartEpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.rules";
import { startEpisodeOfCareSchema } from "@/domain/episode-of-care/episode-of-care.schemas";
import {
  createEpisodeOfCare,
  getActiveEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import {
  existsAnotherPatientWithDni,
  getPatientById,
} from "@/infrastructure/repositories/patient.repository";

export interface StartEpisodeOfCareActionResult {
  ok: boolean;
  message?: string;
}

export async function startEpisodeOfCareAction(
  input: unknown,
): Promise<StartEpisodeOfCareActionResult> {
  try {
    const parsedInput = startEpisodeOfCareSchema.parse(input);
    const patient = await getPatientById(parsedInput.patientId);

    if (!patient) {
      return {
        ok: false,
        message: "No se encontró el paciente para iniciar tratamiento.",
      };
    }

    const existingActiveEpisode = await getActiveEpisodeByPatientId(patient.id);

    const duplicatePatientByDni = patient.dni
      ? await existsAnotherPatientWithDni({
          dni: patient.dni,
          excludePatientId: patient.id,
        })
      : false;

    const startValidation = canStartEpisodeOfCare(patient, {
      hasActiveEpisode: Boolean(existingActiveEpisode),
      duplicatePatientByDni,
    });

    if (!startValidation.ok) {
      return {
        ok: false,
        message: startValidation.message,
      };
    }

    await createEpisodeOfCare(parsedInput);

    return {
      ok: true,
      message: "Tratamiento iniciado correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar el tratamiento.";

    return {
      ok: false,
      message,
    };
  }
}
