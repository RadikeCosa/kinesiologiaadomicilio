"use server";

import { revalidatePath } from "next/cache";

import { updateEncounterClinicalNoteSchema } from "@/domain/encounter/encounter.schemas";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import {
  getEncounterById,
  updateEncounterClinicalNote,
} from "@/infrastructure/repositories/encounter.repository";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";

export interface UpdateEncounterClinicalNoteActionResult {
  ok: boolean;
  message?: string;
}

function getEffectiveEpisode(activeEpisode: EpisodeOfCare | null, mostRecentEpisode: EpisodeOfCare | null): EpisodeOfCare | null {
  return activeEpisode ?? mostRecentEpisode;
}

export async function updateEncounterClinicalNoteAction(
  input: unknown,
): Promise<UpdateEncounterClinicalNoteActionResult> {
  try {
    const parsedInput = updateEncounterClinicalNoteSchema.parse(input);
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

    const [activeEpisode, mostRecentEpisode] = await Promise.all([
      getActiveEpisodeByPatientId(parsedInput.patientId),
      getMostRecentEpisodeByPatientId(parsedInput.patientId),
    ]);
    const effectiveEpisode = getEffectiveEpisode(activeEpisode, mostRecentEpisode);

    if (!effectiveEpisode || encounter.episodeOfCareId !== effectiveEpisode.id) {
      return {
        ok: false,
        message: "La visita no corresponde al tratamiento visible actual.",
      };
    }

    await updateEncounterClinicalNote(parsedInput);
    revalidatePath(`/admin/patients/${parsedInput.patientId}/encounters`);

    return {
      ok: true,
      message: "Nota clínica actualizada correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo actualizar la nota clínica.",
    };
  }
}
