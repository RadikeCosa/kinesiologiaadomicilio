import type { CreateTreatmentEvolutionReportInput } from "@/domain/treatment-evolution-report/treatment-evolution-report.types";
import {
  TREATMENT_EVOLUTION_REPORT_TYPE_CODE,
  TREATMENT_EVOLUTION_REPORT_TYPE_SYSTEM,
  DOCUMENT_REFERENCE_ENCOUNTER_COUNT_EXTENSION_URL,
  DOCUMENT_REFERENCE_EPISODE_START_DATE_EXTENSION_URL,
  DOCUMENT_REFERENCE_FIRST_ENCOUNTER_STARTED_AT_EXTENSION_URL,
  DOCUMENT_REFERENCE_FRAMEWORK_PLAN_SNAPSHOT_EXTENSION_URL,
  DOCUMENT_REFERENCE_FUNCTIONAL_METRICS_SUMMARY_SNAPSHOT_EXTENSION_URL,
  DOCUMENT_REFERENCE_INITIAL_FUNCTIONAL_STATUS_SNAPSHOT_EXTENSION_URL,
  DOCUMENT_REFERENCE_KINESIOLOGIC_DIAGNOSIS_SNAPSHOT_EXTENSION_URL,
  DOCUMENT_REFERENCE_LAST_ENCOUNTER_STARTED_AT_EXTENSION_URL,
  DOCUMENT_REFERENCE_MEDICAL_DIAGNOSIS_SNAPSHOT_EXTENSION_URL,
  DOCUMENT_REFERENCE_REPORT_TYPE_EXTENSION_URL,
  DOCUMENT_REFERENCE_THERAPEUTIC_GOALS_SNAPSHOT_EXTENSION_URL,
  DOCUMENT_REFERENCE_TREATMENT_STATUS_EXTENSION_URL,
} from "@/infrastructure/mappers/document-reference/document-reference.constants";
import type {
  FhirDocumentReference,
  FhirDocumentReferenceExtension,
} from "@/infrastructure/mappers/document-reference/document-reference-fhir.types";
import { buildEpisodeOfCareReference, buildPatientReference } from "@/lib/fhir/references";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function toBase64(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64");
}

function buildOptionalStringExtension(url: string, value?: string): FhirDocumentReferenceExtension[] {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return [];
  }

  return [{ url, valueString: normalized }];
}

function buildOptionalDateTimeExtension(url: string, value?: string): FhirDocumentReferenceExtension[] {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return [];
  }

  return [{ url, valueDateTime: normalized }];
}

export function mapTreatmentEvolutionReportToFhir(
  input: CreateTreatmentEvolutionReportInput,
): FhirDocumentReference {
  const finalText = input.finalText.trim();
  const extensions: FhirDocumentReferenceExtension[] = [
    { url: DOCUMENT_REFERENCE_REPORT_TYPE_EXTENSION_URL, valueCode: input.reportType },
    { url: DOCUMENT_REFERENCE_TREATMENT_STATUS_EXTENSION_URL, valueCode: input.treatmentStatusAtReport },
    { url: DOCUMENT_REFERENCE_EPISODE_START_DATE_EXTENSION_URL, valueDate: input.episodeStartDate },
    { url: DOCUMENT_REFERENCE_ENCOUNTER_COUNT_EXTENSION_URL, valueInteger: input.encounterCount },
    ...buildOptionalDateTimeExtension(
      DOCUMENT_REFERENCE_FIRST_ENCOUNTER_STARTED_AT_EXTENSION_URL,
      input.firstEncounterStartedAt,
    ),
    ...buildOptionalDateTimeExtension(
      DOCUMENT_REFERENCE_LAST_ENCOUNTER_STARTED_AT_EXTENSION_URL,
      input.lastEncounterStartedAt,
    ),
    ...buildOptionalStringExtension(
      DOCUMENT_REFERENCE_MEDICAL_DIAGNOSIS_SNAPSHOT_EXTENSION_URL,
      input.medicalDiagnosisSnapshot,
    ),
    ...buildOptionalStringExtension(
      DOCUMENT_REFERENCE_KINESIOLOGIC_DIAGNOSIS_SNAPSHOT_EXTENSION_URL,
      input.kinesiologicDiagnosisSnapshot,
    ),
    ...buildOptionalStringExtension(
      DOCUMENT_REFERENCE_INITIAL_FUNCTIONAL_STATUS_SNAPSHOT_EXTENSION_URL,
      input.initialFunctionalStatusSnapshot,
    ),
    ...buildOptionalStringExtension(
      DOCUMENT_REFERENCE_THERAPEUTIC_GOALS_SNAPSHOT_EXTENSION_URL,
      input.therapeuticGoalsSnapshot,
    ),
    ...buildOptionalStringExtension(
      DOCUMENT_REFERENCE_FRAMEWORK_PLAN_SNAPSHOT_EXTENSION_URL,
      input.frameworkPlanSnapshot,
    ),
    ...buildOptionalStringExtension(
      DOCUMENT_REFERENCE_FUNCTIONAL_METRICS_SUMMARY_SNAPSHOT_EXTENSION_URL,
      input.functionalMetricsSummarySnapshot,
    ),
  ];

  return {
    resourceType: "DocumentReference",
    status: "current",
    subject: {
      reference: buildPatientReference(input.patientId),
    },
    type: {
      coding: [{
        system: TREATMENT_EVOLUTION_REPORT_TYPE_SYSTEM,
        code: TREATMENT_EVOLUTION_REPORT_TYPE_CODE,
        display: "Informe evolutivo de tratamiento",
      }],
      text: "Informe evolutivo de tratamiento",
    },
    date: input.createdAt,
    description: input.reportType === "stage_closure" ? "Cierre de etapa" : "Informe de progreso",
    extension: extensions,
    context: {
      related: [{
        reference: buildEpisodeOfCareReference(input.episodeId),
      }],
    },
    content: [{
      attachment: {
        contentType: "text/plain; charset=utf-8",
        data: toBase64(finalText),
        title: input.reportType === "stage_closure" ? "Cierre de etapa" : "Informe de progreso",
        creation: input.createdAt,
      },
    }],
  };
}
