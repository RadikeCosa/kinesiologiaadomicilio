import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

function extractFirstServiceRequestId(
  referralRequest: FhirEpisodeOfCare["referralRequest"],
): string | undefined {
  if (!referralRequest?.length) {
    return undefined;
  }

  for (const reference of referralRequest) {
    const referenceValue = reference.reference?.trim();

    if (!referenceValue || !/(^|\/)ServiceRequest\//.test(referenceValue)) {
      continue;
    }

    const extractedId = extractIdFromReference(referenceValue);

    if (extractedId) {
      return extractedId;
    }
  }

  return undefined;
}

export function mapEpisodeOfCareRead(resource: EpisodeOfCare): EpisodeOfCare {
  return {
    id: resource.id,
    patientId: resource.patientId,
    status: resource.status,
    startDate: resource.startDate,
    endDate: resource.endDate,
    serviceRequestId: resource.serviceRequestId,
  };
}

export function mapFhirEpisodeOfCareToDomain(resource: FhirEpisodeOfCare): EpisodeOfCare {
  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.patient?.reference) ?? "",
    status: resource.status,
    startDate: resource.period?.start ?? "",
    endDate: resource.period?.end,
    serviceRequestId: extractFirstServiceRequestId(resource.referralRequest),
  };
}
