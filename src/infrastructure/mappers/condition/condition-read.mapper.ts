import type { EpisodeDiagnosis, EpisodeDiagnosisKind } from "@/domain/treatment-context/treatment-context.types";

import { type FhirCondition } from "@/infrastructure/mappers/condition/condition-fhir.types";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function mapFhirConditionToEpisodeDiagnosis(resource: FhirCondition, kind: EpisodeDiagnosisKind): EpisodeDiagnosis {
  return {
    conditionId: normalizeOptionalString(resource.id),
    kind,
    text: normalizeOptionalString(resource.code?.text) ?? "",
    recordedAt: normalizeOptionalString(resource.recordedDate),
    clinicalStatus: resource.clinicalStatus?.coding?.[0]?.code as EpisodeDiagnosis["clinicalStatus"],
  };
}
