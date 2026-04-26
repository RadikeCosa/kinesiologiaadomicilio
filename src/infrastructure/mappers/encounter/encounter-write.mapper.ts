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
      end: input.endedAt,
    },
  };
}

export function mapEncounterTimeRangeUpdate(existing: FhirEncounter, startedAt: string, endedAt: string): FhirEncounter {
  return {
    ...existing,
    period: {
      ...existing.period,
      start: startedAt,
      end: endedAt,
    },
  };
}
