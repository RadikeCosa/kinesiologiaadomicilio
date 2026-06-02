"use server";

import { revalidatePath } from "next/cache";

import { SigningProfessionalAmbiguousError, upsertSigningProfessionalConfig } from "@/infrastructure/repositories/practitioner.repository";

export interface UpsertSigningProfessionalActionResult {
  ok: boolean;
  message?: string;
}

export async function upsertSigningProfessionalAction(input: unknown): Promise<UpsertSigningProfessionalActionResult> {
  try {
    await upsertSigningProfessionalConfig(input as Parameters<typeof upsertSigningProfessionalConfig>[0]);
    revalidatePath("/admin/configuracion/profesional");

    return {
      ok: true,
      message: "Profesional firmante guardado correctamente.",
    };
  } catch (error) {
    if (error instanceof SigningProfessionalAmbiguousError) {
      return {
        ok: false,
        message: "Hay más de un profesional marcado como firmante principal. No se puede guardar hasta resolver la ambigüedad.",
      };
    }

    const message = error instanceof Error ? error.message : "No se pudo guardar la configuración del profesional.";

    return {
      ok: false,
      message,
    };
  }
}
