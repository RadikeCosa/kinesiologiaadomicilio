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
    description: resource.description,
  };
}

export function mapFhirEpisodeOfCareToDomain(resource: FhirEpisodeOfCare): EpisodeOfCare {
  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.patient?.reference) ?? "",
    status: "active",
    startDate: resource.period?.start ?? "",
    description: extractEpisodeDescriptionFromNotes(resource.note),
  };
}
