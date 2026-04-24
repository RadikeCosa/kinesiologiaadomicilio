import type { CreateEncounterInput } from "@/domain/encounter/encounter.types";
import { buildEpisodeOfCareReference, buildPatientReference } from "@/lib/fhir/references";

import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";

export function mapCreateEncounterInputToFhir(input: CreateEncounterInput): FhirEncounter {
  const startedAt = input.startedAt || input.occurrenceDate || "";

  return {
    resourceType: "Encounter",
    status: "finished",
    subject: {
      reference: buildPatientReference(input.patientId),
    },
    episodeOfCare: [
      {
        reference: buildEpisodeOfCareReference(input.episodeOfCareId),
      },
    ],
    period: {
      start: startedAt,
      ...(input.endedAt ? { end: input.endedAt } : {}),
    },
  };
}

export function mapEncounterStartDateTimeUpdate(existing: FhirEncounter, startedAt: string): FhirEncounter {
  const existingEndedAt = existing.period?.end;

  if (existingEndedAt) {
    const startedAtTimestamp = new Date(startedAt).getTime();
    const endedAtTimestamp = new Date(existingEndedAt).getTime();

    if (!Number.isNaN(startedAtTimestamp) && !Number.isNaN(endedAtTimestamp) && startedAtTimestamp > endedAtTimestamp) {
      throw new Error("No se puede mover el inicio después de la finalización registrada.");
    }
  }

  return {
    ...existing,
    period: {
      ...existing.period,
      start: startedAt,
    },
  };
}
