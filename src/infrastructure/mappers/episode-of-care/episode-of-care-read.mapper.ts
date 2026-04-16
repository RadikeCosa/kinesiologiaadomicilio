import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";

export function mapEpisodeOfCareRead(resource: unknown): EpisodeOfCare {
  // TODO(slice-1/fase-2): mapear recurso real de infraestructura a dominio.
  void resource;

  return {
    id: "",
    patientId: "",
    status: "active",
    startDate: "",
    description: undefined,
  };
}
