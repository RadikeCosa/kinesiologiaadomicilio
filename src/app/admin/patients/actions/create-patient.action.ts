"use server";

import { createPatientSchema } from "@/domain/patient/patient.schemas";
import { canCreatePatient } from "@/domain/patient/patient.rules";
import { createPatient } from "@/infrastructure/repositories/patient.repository";

export interface CreatePatientActionResult {
  ok: boolean;
  patientId?: string;
  message?: string;
}

export async function createPatientAction(input: unknown): Promise<CreatePatientActionResult> {
  try {
    const parsedInput = createPatientSchema.parse(input);
    const createValidation = canCreatePatient(parsedInput);

    if (!createValidation.ok) {
      return { ok: false, message: createValidation.message };
    }

    const patient = await createPatient(parsedInput);

    return {
      ok: true,
      patientId: patient.id,
      message: "Paciente creado correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el paciente.";

    return {
      ok: false,
      message,
    };
  }
}
