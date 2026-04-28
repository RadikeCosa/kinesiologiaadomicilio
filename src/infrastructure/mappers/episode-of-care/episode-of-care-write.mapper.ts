import type {
  FinishEpisodeOfCareInput,
  StartEpisodeOfCareInput,
} from "@/domain/episode-of-care/episode-of-care.types";
import { buildPatientReference } from "@/lib/fhir/references";

import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

export function mapStartEpisodeOfCareInputToFhir(input: StartEpisodeOfCareInput): FhirEpisodeOfCare {
  const serviceRequestId = input.serviceRequestId?.trim();

  return {
    resourceType: "EpisodeOfCare",
    status: "active",
    patient: {
      reference: buildPatientReference(input.patientId),
    },
    period: {
      start: input.startDate,
    },
    referralRequest: serviceRequestId
      ? [{ reference: `ServiceRequest/${serviceRequestId}` }]
      : undefined,
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
