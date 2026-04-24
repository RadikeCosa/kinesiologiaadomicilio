import type { Encounter } from "@/domain/encounter/encounter.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";

export function mapFhirEncounterToDomain(resource: FhirEncounter): Encounter {
  const startedAt = resource.period?.start ?? resource.period?.end ?? "";
  const endedAt = resource.period?.end;
  const startedAtTimestamp = new Date(startedAt).getTime();
  const endedAtTimestamp = new Date(endedAt ?? "").getTime();

  const hasStartedAt = Boolean(resource.period?.start);
  const hasEndedAt = Boolean(endedAt);
  const hasValidChronologicalPeriod =
    !Number.isNaN(startedAtTimestamp)
    && !Number.isNaN(endedAtTimestamp)
    && endedAtTimestamp >= startedAtTimestamp;
  const shouldExposeEndedAt =
    hasStartedAt
    && hasEndedAt
    && startedAt !== endedAt
    // Tolerant read for external invalid data: if end < start we keep startedAt and hide endedAt.
    && hasValidChronologicalPeriod;

  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.subject?.reference) ?? "",
    episodeOfCareId: extractIdFromReference(resource.episodeOfCare?.[0]?.reference) ?? "",
    startedAt,
    ...(shouldExposeEndedAt ? { endedAt } : {}),
    status: "finished",
  };
}
