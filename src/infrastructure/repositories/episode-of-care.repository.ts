import type { EpisodeOfCare, StartEpisodeOfCareInput } from "@/domain/episode-of-care/episode-of-care.types";

/**
 * Implementación transicional del Slice 1.
 *
 * Nota: dataset mínimo en memoria, acotado a lectura para detalle de paciente.
 */
const transitionalEpisodesOfCare: EpisodeOfCare[] = [
  {
    id: "epi-001",
    patientId: "pat-003",
    status: "active",
    startDate: "2026-04-12",
    description: "Plan inicial de rehabilitación domiciliaria.",
  },
];

export async function getActiveEpisodeByPatientId(patientId: string): Promise<EpisodeOfCare | null> {
  const episode = transitionalEpisodesOfCare.find(
    (item) => item.patientId === patientId && item.status === "active",
  );

  return episode ?? null;
}

export async function createEpisodeOfCare(input: StartEpisodeOfCareInput): Promise<EpisodeOfCare> {
  const createdEpisode: EpisodeOfCare = {
    id: `epi-${Date.now()}`,
    patientId: input.patientId,
    status: "active",
    startDate: input.startDate,
    description: input.description,
  };

  transitionalEpisodesOfCare.unshift(createdEpisode);
  return createdEpisode;
}
