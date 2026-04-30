import type { EpisodeOfCare, EpisodeOfCareClosureReason } from "@/domain/episode-of-care/episode-of-care.types";
import { EPISODE_OF_CARE_CLOSURE_REASONS } from "@/domain/episode-of-care/episode-of-care.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

const CLOSURE_REASON_PREFIX = "closure-reason:v1:";
const CLOSURE_DETAIL_PREFIX = "closure-detail:v1:";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function extractClosureReason(note?: FhirEpisodeOfCare["note"]): EpisodeOfCareClosureReason | undefined {
  if (!note?.length) return undefined;

  for (const entry of note) {
    const text = normalizeOptionalString(entry.text);
    if (!text || !text.startsWith(CLOSURE_REASON_PREFIX)) continue;
    const value = text.slice(CLOSURE_REASON_PREFIX.length).trim();
    if (EPISODE_OF_CARE_CLOSURE_REASONS.includes(value as EpisodeOfCareClosureReason)) return value as EpisodeOfCareClosureReason;
  }

  return undefined;
}

function extractClosureDetail(note?: FhirEpisodeOfCare["note"]): string | undefined {
  if (!note?.length) return undefined;
  for (const entry of note) {
    const text = normalizeOptionalString(entry.text);
    if (!text || !text.startsWith(CLOSURE_DETAIL_PREFIX)) continue;
    const value = text.slice(CLOSURE_DETAIL_PREFIX.length).trim();
    if (value) return value;
  }
  return undefined;
}

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
    closureReason: resource.closureReason,
    closureDetail: resource.closureDetail,
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
    closureReason: extractClosureReason(resource.note),
    closureDetail: extractClosureDetail(resource.note),
  };
}
