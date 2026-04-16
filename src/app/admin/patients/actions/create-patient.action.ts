"use server";

import type { CreatePatientInput } from "@/domain/patient/patient.types";

export async function createPatientAction(input: CreatePatientInput): Promise<{ ok: boolean }> {
  // TODO(slice-1/fase-2): validar y persistir paciente en infraestructura.
  void input;

  return { ok: true };
}
