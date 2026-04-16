"use server";

import { updatePatientSchema } from "@/domain/patient/patient.schemas";
import type { UpdatePatientInput } from "@/domain/patient/patient.types";
import { getPatientById, updatePatient } from "@/infrastructure/repositories/patient.repository";

export interface UpdatePatientActionResult {
  ok: boolean;
  message?: string;
}

function compactSlice1MainContact(input: UpdatePatientInput["mainContact"]): UpdatePatientInput["mainContact"] {
  if (!input) {
    return undefined;
  }

  const slice1MainContact = {
    name: input.name,
    relationship: input.relationship,
    phone: input.phone,
  };

  if (!slice1MainContact.name && !slice1MainContact.relationship && !slice1MainContact.phone) {
    return undefined;
  }

  return slice1MainContact;
}

function compactSlice1InitialContext(
  input: UpdatePatientInput["initialContext"],
): UpdatePatientInput["initialContext"] {
  if (!input) {
    return undefined;
  }

  const slice1InitialContext = {
    reasonForConsultation: input.reasonForConsultation,
  };

  if (!slice1InitialContext.reasonForConsultation) {
    return undefined;
  }

  return slice1InitialContext;
}

export async function updatePatientAction(input: unknown): Promise<UpdatePatientActionResult> {
  try {
    const parsedInput = updatePatientSchema.parse(input);
    const scopedInput: UpdatePatientInput = {
      ...parsedInput,
      mainContact: compactSlice1MainContact(parsedInput.mainContact),
      initialContext: compactSlice1InitialContext(parsedInput.initialContext),
    };
    const existingPatient = await getPatientById(parsedInput.id);

    if (!existingPatient) {
      return {
        ok: false,
        message: "No se encontró el paciente que intentás editar.",
      };
    }

    await updatePatient(scopedInput);

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
