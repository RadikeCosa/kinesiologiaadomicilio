import type { Encounter } from "@/domain/encounter/encounter.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";

export function mapFhirEncounterToDomain(resource: FhirEncounter): Encounter {
  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.subject?.reference) ?? "",
    episodeOfCareId: extractIdFromReference(resource.episodeOfCare?.[0]?.reference) ?? "",
    occurrenceDate: resource.period?.start ?? resource.period?.end ?? "",
    status: "finished",
  };
}
