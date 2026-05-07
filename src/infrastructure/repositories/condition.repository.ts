import type { EpisodeDiagnosisInput, EpisodeDiagnosisKind } from "@/domain/treatment-context/treatment-context.types";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";

import { type FhirCondition } from "@/infrastructure/mappers/condition/condition-fhir.types";
import { mapFhirConditionToEpisodeDiagnosis } from "@/infrastructure/mappers/condition/condition-read.mapper";
import { mapDiagnosisInputToFhirCondition } from "@/infrastructure/mappers/condition/condition-write.mapper";

export async function createConditionFromDiagnosis(input: {
  patientId: string;
  diagnosis: EpisodeDiagnosisInput;
}) {
  const payload = mapDiagnosisInputToFhirCondition(input);
  const created = await fhirClient.post<FhirCondition>("Condition", payload);

  return mapFhirConditionToEpisodeDiagnosis(created, input.diagnosis.kind);
}

export async function getConditionDiagnosisById(input: { conditionId: string; kind: EpisodeDiagnosisKind }) {
  if (!input.conditionId.trim()) return null;

  try {
    const resource = await fhirClient.get<FhirCondition>(`Condition/${input.conditionId}`);
    return mapFhirConditionToEpisodeDiagnosis(resource, input.kind);
  } catch (error) {
    if (error instanceof FhirClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
