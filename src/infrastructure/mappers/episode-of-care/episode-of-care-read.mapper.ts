import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";

export function mapEpisodeOfCareRead(resource: EpisodeOfCare): EpisodeOfCare {
  return {
    id: resource.id,
    patientId: resource.patientId,
    status: resource.status,
    startDate: resource.startDate,
    description: resource.description,
  };
}
