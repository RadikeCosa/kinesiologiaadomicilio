import type { EpisodeOfCare, StartEpisodeOfCareInput } from "@/domain/episode-of-care/episode-of-care.types";

export async function getActiveEpisodeByPatientId(patientId: string): Promise<EpisodeOfCare | null> {
  // TODO(slice-1/fase-2): conectar repositorio real.
  void patientId;
  return null;
}

export async function createEpisodeOfCare(input: StartEpisodeOfCareInput): Promise<EpisodeOfCare> {
  void input;
  throw new Error("TODO(slice-1/fase-2): createEpisodeOfCare aún no implementado.");
}
