"use server";

import { canStartEpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.rules";
import { startEpisodeOfCareSchema } from "@/domain/episode-of-care/episode-of-care.schemas";
import {
  createEpisodeOfCare,
  getActiveEpisodeByPatientId,
  listEpisodeOfCareByIncomingReferral,
} from "@/infrastructure/repositories/episode-of-care.repository";
import {
  existsAnotherPatientWithDni,
  getPatientById,
} from "@/infrastructure/repositories/patient.repository";
import { getServiceRequestById } from "@/infrastructure/repositories/service-request.repository";

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

    const duplicatePatientByDni = patient.dni?.trim()
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

    if (!parsedInput.serviceRequestId) {
      return {
        ok: false,
        message: "Para iniciar tratamiento necesitás una solicitud de atención aceptada.",
      };
    }

    {
      const serviceRequest = await getServiceRequestById(parsedInput.serviceRequestId);

      if (!serviceRequest || serviceRequest.patientId !== patient.id) {
        return {
          ok: false,
          message: "No se pudo iniciar el tratamiento con la solicitud indicada.",
        };
      }

      if (serviceRequest.status !== "accepted") {
        return {
          ok: false,
          message: "Solo una solicitud aceptada puede iniciar tratamiento.",
        };
      }

      const linkedEpisodes = await listEpisodeOfCareByIncomingReferral(parsedInput.serviceRequestId);

      if (linkedEpisodes.length > 0) {
        return {
          ok: false,
          message: "Esta solicitud ya fue utilizada para iniciar un tratamiento. Para un nuevo ciclo, registrá una nueva solicitud.",
        };
      }
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
