import type {
  EpisodeDiagnosisKind,
  EpisodeDiagnosisReference,
  EpisodeOfCare,
  EpisodeOfCareClosureReason,
} from "@/domain/episode-of-care/episode-of-care.types";
import { EPISODE_OF_CARE_CLOSURE_REASONS } from "@/domain/episode-of-care/episode-of-care.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";
import {
  EPISODE_CONTEXT_FRAMEWORK_PLAN_EXTENSION_URL,
  EPISODE_CONTEXT_INITIAL_FUNCTIONAL_STATUS_EXTENSION_URL,
  EPISODE_CONTEXT_THERAPEUTIC_GOALS_EXTENSION_URL,
  EPISODE_DIAGNOSIS_ROLE_KINESIOLOGIC_IMPRESSION,
  EPISODE_DIAGNOSIS_ROLE_MEDICAL_REFERENCE,
  EPISODE_DIAGNOSIS_ROLE_SYSTEM,
} from "@/infrastructure/mappers/episode-of-care/episode-of-care-context.constants";

const CLOSURE_REASON_PREFIX = "closure-reason:v1:";
const CLOSURE_DETAIL_PREFIX = "closure-detail:v1:";
const EPISODE_OF_CARE_CLOSURE_REASON_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason";
const EPISODE_OF_CARE_CLOSURE_DETAIL_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function extractClosureReasonFromNote(note?: FhirEpisodeOfCare["note"]): EpisodeOfCareClosureReason | undefined {
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

function extractClosureReasonFromExtension(extension?: FhirEpisodeOfCare["extension"]): EpisodeOfCareClosureReason | undefined {
  if (!extension?.length) return undefined;

  for (const entry of extension) {
    if (entry.url !== EPISODE_OF_CARE_CLOSURE_REASON_EXTENSION_URL) continue;
    const value = normalizeOptionalString(entry.valueCode);
    if (value && EPISODE_OF_CARE_CLOSURE_REASONS.includes(value as EpisodeOfCareClosureReason)) {
      return value as EpisodeOfCareClosureReason;
    }
  }

  return undefined;
}

function extractClosureDetailFromExtension(extension?: FhirEpisodeOfCare["extension"]): string | undefined {
  if (!extension?.length) return undefined;
  for (const entry of extension) {
    if (entry.url !== EPISODE_OF_CARE_CLOSURE_DETAIL_EXTENSION_URL) continue;
    const value = normalizeOptionalString(entry.valueString);
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

function extractDiagnosisKind(resource: FhirEpisodeOfCare["diagnosis"][number]): EpisodeDiagnosisKind | undefined {
  const coding = resource.role?.coding;
  if (!coding?.length) return undefined;
  for (const item of coding) {
    if (item.system !== EPISODE_DIAGNOSIS_ROLE_SYSTEM) continue;
    if (item.code === EPISODE_DIAGNOSIS_ROLE_MEDICAL_REFERENCE) return EPISODE_DIAGNOSIS_ROLE_MEDICAL_REFERENCE;
    if (item.code === EPISODE_DIAGNOSIS_ROLE_KINESIOLOGIC_IMPRESSION) return EPISODE_DIAGNOSIS_ROLE_KINESIOLOGIC_IMPRESSION;
  }
  return undefined;
}

function extractDiagnosisReferences(diagnosis?: FhirEpisodeOfCare["diagnosis"]): EpisodeDiagnosisReference[] | undefined {
  if (!diagnosis?.length) return undefined;
  const items = diagnosis.flatMap((entry) => {
    const kind = extractDiagnosisKind(entry);
    if (!kind) return [];
    const conditionId = extractIdFromReference(entry.condition?.reference);
    if (!conditionId) return [];
    return [{ kind, conditionId }];
  });
  return items.length ? items : undefined;
}

function readContextExtension(extension: FhirEpisodeOfCare["extension"] | undefined, url: string): string | undefined {
  const entry = extension?.find((item) => item.url === url);
  return normalizeOptionalString(entry?.valueString);
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
  const closureReasonFromExtension = extractClosureReasonFromExtension(resource.extension);
  const closureDetailFromExtension = extractClosureDetailFromExtension(resource.extension);
  const clinicalContext = {
    initialFunctionalStatus: readContextExtension(resource.extension, EPISODE_CONTEXT_INITIAL_FUNCTIONAL_STATUS_EXTENSION_URL),
    therapeuticGoals: readContextExtension(resource.extension, EPISODE_CONTEXT_THERAPEUTIC_GOALS_EXTENSION_URL),
    frameworkPlan: readContextExtension(resource.extension, EPISODE_CONTEXT_FRAMEWORK_PLAN_EXTENSION_URL),
  };
  const hasClinicalContext = Object.values(clinicalContext).some(Boolean);

  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.patient?.reference) ?? "",
    status: resource.status,
    startDate: resource.period?.start ?? "",
    endDate: resource.period?.end,
    serviceRequestId: extractFirstServiceRequestId(resource.referralRequest),
    closureReason: closureReasonFromExtension ?? extractClosureReasonFromNote(resource.note),
    closureDetail: closureDetailFromExtension ?? extractClosureDetail(resource.note),
    diagnosisReferences: extractDiagnosisReferences(resource.diagnosis),
    clinicalContext: hasClinicalContext ? clinicalContext : undefined,
  };
}
