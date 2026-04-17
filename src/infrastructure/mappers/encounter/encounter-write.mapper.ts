import type { CreateEncounterInput } from "@/domain/encounter/encounter.types";
import { buildEpisodeOfCareReference, buildPatientReference } from "@/lib/fhir/references";

import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";

export function mapCreateEncounterInputToFhir(input: CreateEncounterInput): FhirEncounter {
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
      start: input.occurrenceDate,
      end: input.occurrenceDate,
    },
  };
}
