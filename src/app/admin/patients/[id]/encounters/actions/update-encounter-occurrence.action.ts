"use server";

import { revalidatePath } from "next/cache";

import { updateEncounterOccurrenceSchema } from "@/domain/encounter/encounter.schemas";
import {
  getEncounterById,
  updateEncounterOccurrenceDateTime,
} from "@/infrastructure/repositories/encounter.repository";

export interface UpdateEncounterOccurrenceActionResult {
  ok: boolean;
  message?: string;
}

export async function updateEncounterOccurrenceAction(
  input: unknown,
): Promise<UpdateEncounterOccurrenceActionResult> {
  try {
    const parsedInput = updateEncounterOccurrenceSchema.parse(input);
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

    await updateEncounterOccurrenceDateTime(parsedInput);

    revalidatePath(`/admin/patients/${parsedInput.patientId}/encounters`);

    return {
      ok: true,
      message: "Fecha y hora de visita actualizadas correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la visita.";

    return {
      ok: false,
      message,
    };
  }
}
