"use server";

import type { StartEpisodeOfCareInput } from "@/domain/episode-of-care/episode-of-care.types";

export async function startEpisodeOfCareAction(
  input: StartEpisodeOfCareInput,
): Promise<{ ok: boolean }> {
  // TODO(slice-1/fase-2): validar y persistir apertura de tratamiento activo.
  void input;

  return { ok: true };
}
