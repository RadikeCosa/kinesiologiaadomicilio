import type {
  EpisodeClinicalContext,
  EpisodeDiagnosisReference,
  FinishEpisodeOfCareInput,
  StartEpisodeOfCareInput,
} from "@/domain/episode-of-care/episode-of-care.types";
import { buildPatientReference } from "@/lib/fhir/references";

import { type FhirEpisodeOfCare, type FhirExtension } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";
import {
  EPISODE_CONTEXT_FRAMEWORK_PLAN_EXTENSION_URL,
  EPISODE_CONTEXT_INITIAL_FUNCTIONAL_STATUS_EXTENSION_URL,
  EPISODE_CONTEXT_THERAPEUTIC_GOALS_EXTENSION_URL,
  EPISODE_DIAGNOSIS_ROLE_KINESIOLOGIC_IMPRESSION,
  EPISODE_DIAGNOSIS_ROLE_MEDICAL_REFERENCE,
  EPISODE_DIAGNOSIS_ROLE_SYSTEM,
} from "@/infrastructure/mappers/episode-of-care/episode-of-care-context.constants";

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

function removeContextExtensions(extension?: FhirEpisodeOfCare["extension"]): FhirExtension[] {
  if (!extension?.length) return [];
  return extension.filter((entry) => ![
    EPISODE_CONTEXT_INITIAL_FUNCTIONAL_STATUS_EXTENSION_URL,
    EPISODE_CONTEXT_THERAPEUTIC_GOALS_EXTENSION_URL,
    EPISODE_CONTEXT_FRAMEWORK_PLAN_EXTENSION_URL,
  ].includes(entry.url));
}

function buildContextExtensions(context?: EpisodeClinicalContext): FhirExtension[] {
  if (!context) return [];
  const map: Array<[string, string | undefined]> = [
    [EPISODE_CONTEXT_INITIAL_FUNCTIONAL_STATUS_EXTENSION_URL, normalizeOptionalString(context.initialFunctionalStatus)],
    [EPISODE_CONTEXT_THERAPEUTIC_GOALS_EXTENSION_URL, normalizeOptionalString(context.therapeuticGoals)],
    [EPISODE_CONTEXT_FRAMEWORK_PLAN_EXTENSION_URL, normalizeOptionalString(context.frameworkPlan)],
  ];
  return map.flatMap(([url, value]) => (value ? [{ url, valueString: value }] : []));
}

function roleMatches(item: NonNullable<FhirEpisodeOfCare["diagnosis"]>[number], code: string): boolean {
  return item.role?.coding?.some((coding) => coding.system === EPISODE_DIAGNOSIS_ROLE_SYSTEM && coding.code === code) ?? false;
}

function upsertDiagnosisByRole(existing: FhirEpisodeOfCare["diagnosis"], references?: EpisodeDiagnosisReference[]) {
  const base = existing ?? [];
  if (!references?.length) return base;
  const filtered = base.filter((item) => !roleMatches(item, EPISODE_DIAGNOSIS_ROLE_MEDICAL_REFERENCE)
    && !roleMatches(item, EPISODE_DIAGNOSIS_ROLE_KINESIOLOGIC_IMPRESSION));
  const mapped = references.map((reference) => ({
    condition: { reference: `Condition/${reference.conditionId}` },
    role: {
      coding: [{
        system: EPISODE_DIAGNOSIS_ROLE_SYSTEM,
        code: reference.kind,
      }],
    },
  }));
  return [...filtered, ...mapped];
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

export function applyEpisodeClinicalContextToFhir(
  existing: FhirEpisodeOfCare,
  input: {
    diagnosisReferences?: EpisodeDiagnosisReference[];
    clinicalContext?: EpisodeClinicalContext;
  },
): FhirEpisodeOfCare {
  const extensionWithoutContext = removeContextExtensions(existing.extension);
  const contextExtensions = buildContextExtensions(input.clinicalContext);
  const nextDiagnosis = upsertDiagnosisByRole(existing.diagnosis, input.diagnosisReferences);

  return {
    ...existing,
    diagnosis: nextDiagnosis.length ? nextDiagnosis : undefined,
    extension: [...extensionWithoutContext, ...contextExtensions],
  };
}
