import type {
  FinishEpisodeOfCareInput,
  StartEpisodeOfCareInput,
} from "@/domain/episode-of-care/episode-of-care.types";
import { buildPatientReference } from "@/lib/fhir/references";

import { type FhirEpisodeOfCare, type FhirExtension } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

const EPISODE_OF_CARE_CLOSURE_REASON_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason";
const EPISODE_OF_CARE_CLOSURE_DETAIL_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function buildClosureExtensions(input: Pick<FinishEpisodeOfCareInput, "closureReason" | "closureDetail">): FhirExtension[] {
  const extensions: FhirExtension[] = [{
    url: EPISODE_OF_CARE_CLOSURE_REASON_EXTENSION_URL,
    valueCode: input.closureReason,
  }];
  const detail = normalizeOptionalString(input.closureDetail);

  if (detail) {
    extensions.push({
      url: EPISODE_OF_CARE_CLOSURE_DETAIL_EXTENSION_URL,
      valueString: detail,
    });
  }

  return extensions;
}

function removeClosureExtensions(extension?: FhirEpisodeOfCare["extension"]): FhirExtension[] {
  if (!extension?.length) {
    return [];
  }

  return extension.filter((entry) => entry.url !== EPISODE_OF_CARE_CLOSURE_REASON_EXTENSION_URL
      && entry.url !== EPISODE_OF_CARE_CLOSURE_DETAIL_EXTENSION_URL);
}

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
  input: Pick<FinishEpisodeOfCareInput, "endDate" | "closureReason" | "closureDetail">,
): FhirEpisodeOfCare {
  const extensionsWithoutClosure = removeClosureExtensions(existing.extension);
  const closureExtensions = buildClosureExtensions(input);
  const nextExtension = [...extensionsWithoutClosure, ...closureExtensions];

  return {
    ...existing,
    status: "finished",
    period: {
      ...existing.period,
      end: input.endDate,
    },
    extension: nextExtension.length ? nextExtension : undefined,
  };
}
