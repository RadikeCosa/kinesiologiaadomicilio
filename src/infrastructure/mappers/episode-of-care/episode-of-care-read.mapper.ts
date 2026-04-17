import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import { extractEpisodeDescriptionFromNotes } from "@/infrastructure/mappers/episode-of-care/episode-of-care-note.helpers";
import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

export function mapEpisodeOfCareRead(resource: EpisodeOfCare): EpisodeOfCare {
  return {
    id: resource.id,
    patientId: resource.patientId,
    status: resource.status,
    startDate: resource.startDate,
    endDate: resource.endDate,
    description: resource.description,
  };
}

export function mapFhirEpisodeOfCareToDomain(resource: FhirEpisodeOfCare): EpisodeOfCare {
  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.patient?.reference) ?? "",
    status: resource.status,
    startDate: resource.period?.start ?? "",
    endDate: resource.period?.end,
    description: extractEpisodeDescriptionFromNotes(resource.note),
  };
}
