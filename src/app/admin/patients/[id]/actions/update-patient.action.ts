"use server";

import { updatePatientSchema } from "@/domain/patient/patient.schemas";
import { getPatientById, updatePatient } from "@/infrastructure/repositories/patient.repository";

export interface UpdatePatientActionResult {
  ok: boolean;
  message?: string;
}

export async function updatePatientAction(input: unknown): Promise<UpdatePatientActionResult> {
  try {
    const parsedInput = updatePatientSchema.parse(input);
    const existingPatient = await getPatientById(parsedInput.id);

    if (!existingPatient) {
      return {
        ok: false,
        message: "No se encontró el paciente que intentás editar.",
      };
    }

    await updatePatient(parsedInput);

    return {
      ok: true,
      message: "Paciente actualizado correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el paciente.";

    return {
      ok: false,
      message,
    };
  }
}
