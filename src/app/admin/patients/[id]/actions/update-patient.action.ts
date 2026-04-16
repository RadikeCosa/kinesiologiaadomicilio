"use server";

import type { UpdatePatientInput } from "@/domain/patient/patient.types";

export async function updatePatientAction(input: UpdatePatientInput): Promise<{ ok: boolean }> {
  // TODO(slice-1/fase-2): validar y persistir edición de paciente.
  void input;

  return { ok: true };
}
