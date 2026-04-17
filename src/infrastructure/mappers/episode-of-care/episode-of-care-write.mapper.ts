import type {
  FinishEpisodeOfCareInput,
  StartEpisodeOfCareInput,
} from "@/domain/episode-of-care/episode-of-care.types";
import { buildPatientReference } from "@/lib/fhir/references";

import { upsertEpisodeDescriptionInNotes } from "@/infrastructure/mappers/episode-of-care/episode-of-care-note.helpers";
import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

export function mapStartEpisodeOfCareInputToFhir(input: StartEpisodeOfCareInput): FhirEpisodeOfCare {
  return {
    resourceType: "EpisodeOfCare",
    status: "active",
    patient: {
      reference: buildPatientReference(input.patientId),
    },
    period: {
      start: input.startDate,
    },
    note: upsertEpisodeDescriptionInNotes({
      description: input.description,
    }),
  };
}

export function applyFinishEpisodeOfCareToFhir(
  existing: FhirEpisodeOfCare,
  input: Pick<FinishEpisodeOfCareInput, "endDate">,
): FhirEpisodeOfCare {
  return {
    ...existing,
    status: "finished",
    period: {
      ...existing.period,
      end: input.endDate,
    },
  };
}
