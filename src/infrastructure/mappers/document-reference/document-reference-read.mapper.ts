import type { TreatmentEvolutionReport } from "@/domain/treatment-evolution-report/treatment-evolution-report.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import type {
  FhirDocumentReference,
  FhirDocumentReferenceExtension,
} from "@/infrastructure/mappers/document-reference/document-reference-fhir.types";
import {
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

function findExtension(
  extension: FhirDocumentReference["extension"],
  url: string,
): FhirDocumentReferenceExtension | undefined {
  return extension?.find((entry) => entry.url === url);
}

function decodeAttachmentData(data?: string): string {
  if (!data) {
    return "";
  }

  try {
    return Buffer.from(data, "base64").toString("utf-8").trim();
  } catch {
    return "";
  }
}

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function mapFhirDocumentReferenceToTreatmentEvolutionReport(
  resource: FhirDocumentReference,
): TreatmentEvolutionReport {
  const attachment = resource.content?.[0]?.attachment;
  const relatedEpisodeReference = resource.context?.related?.[0]?.reference;
  const reportTypeExtension = findExtension(resource.extension, DOCUMENT_REFERENCE_REPORT_TYPE_EXTENSION_URL);
  const treatmentStatusExtension = findExtension(resource.extension, DOCUMENT_REFERENCE_TREATMENT_STATUS_EXTENSION_URL);
  const encounterCountExtension = findExtension(resource.extension, DOCUMENT_REFERENCE_ENCOUNTER_COUNT_EXTENSION_URL);

  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.subject?.reference) ?? "",
    episodeId: extractIdFromReference(relatedEpisodeReference) ?? "",
    createdAt: normalizeOptionalString(resource.date)
      ?? normalizeOptionalString(attachment?.creation)
      ?? "",
    reportType: (reportTypeExtension?.valueCode === "stage_closure" ? "stage_closure" : "progress"),
    treatmentStatusAtReport: treatmentStatusExtension?.valueCode === "finished" ? "finished" : "active",
    episodeStartDate: findExtension(resource.extension, DOCUMENT_REFERENCE_EPISODE_START_DATE_EXTENSION_URL)?.valueDate ?? "",
    encounterCount: encounterCountExtension?.valueInteger ?? 0,
    firstEncounterStartedAt: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_FIRST_ENCOUNTER_STARTED_AT_EXTENSION_URL)?.valueDateTime,
    ),
    lastEncounterStartedAt: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_LAST_ENCOUNTER_STARTED_AT_EXTENSION_URL)?.valueDateTime,
    ),
    medicalDiagnosisSnapshot: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_MEDICAL_DIAGNOSIS_SNAPSHOT_EXTENSION_URL)?.valueString,
    ),
    kinesiologicDiagnosisSnapshot: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_KINESIOLOGIC_DIAGNOSIS_SNAPSHOT_EXTENSION_URL)?.valueString,
    ),
    initialFunctionalStatusSnapshot: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_INITIAL_FUNCTIONAL_STATUS_SNAPSHOT_EXTENSION_URL)?.valueString,
    ),
    therapeuticGoalsSnapshot: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_THERAPEUTIC_GOALS_SNAPSHOT_EXTENSION_URL)?.valueString,
    ),
    frameworkPlanSnapshot: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_FRAMEWORK_PLAN_SNAPSHOT_EXTENSION_URL)?.valueString,
    ),
    functionalMetricsSummarySnapshot: normalizeOptionalString(
      findExtension(resource.extension, DOCUMENT_REFERENCE_FUNCTIONAL_METRICS_SUMMARY_SNAPSHOT_EXTENSION_URL)?.valueString,
    ),
    finalText: decodeAttachmentData(attachment?.data),
  };
}
