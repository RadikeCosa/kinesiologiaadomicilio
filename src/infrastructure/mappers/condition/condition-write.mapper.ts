import type { EpisodeDiagnosisInput } from "@/domain/treatment-context/treatment-context.types";
import { buildPatientReference } from "@/lib/fhir/references";

import { type FhirCondition } from "@/infrastructure/mappers/condition/condition-fhir.types";

const CONDITION_CLINICAL_STATUS_SYSTEM = "http://terminology.hl7.org/CodeSystem/condition-clinical";

function normalizeText(value: string): string {
  return value.trim();
}

export function mapDiagnosisInputToFhirCondition(input: {
  patientId: string;
  diagnosis: EpisodeDiagnosisInput;
}): FhirCondition {
  const text = normalizeText(input.diagnosis.text);

  return {
    resourceType: "Condition",
    subject: {
      reference: buildPatientReference(input.patientId),
    },
    code: {
      text,
    },
    ...(input.diagnosis.recordedAt ? { recordedDate: input.diagnosis.recordedAt } : {}),
    ...(input.diagnosis.clinicalStatus ? {
      clinicalStatus: {
        coding: [{ system: CONDITION_CLINICAL_STATUS_SYSTEM, code: input.diagnosis.clinicalStatus }],
      },
    } : {}),
  };
}
