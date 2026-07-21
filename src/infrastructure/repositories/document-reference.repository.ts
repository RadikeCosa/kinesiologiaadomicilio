import type {
  CreateTreatmentEvolutionReportInput,
  TreatmentEvolutionReport,
} from "@/domain/treatment-evolution-report/treatment-evolution-report.types";
import { extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { buildDocumentReferenceBySubjectQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import { type FhirDocumentReference } from "@/infrastructure/mappers/document-reference/document-reference-fhir.types";
import { mapFhirDocumentReferenceToTreatmentEvolutionReport } from "@/infrastructure/mappers/document-reference/document-reference-read.mapper";
import { mapTreatmentEvolutionReportToFhir } from "@/infrastructure/mappers/document-reference/document-reference-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

export async function createTreatmentEvolutionReport(
  input: CreateTreatmentEvolutionReportInput,
): Promise<TreatmentEvolutionReport> {
  const payload = mapTreatmentEvolutionReportToFhir(input);
  const created = await fhirClient.post<FhirDocumentReference>("DocumentReference", payload);

  return mapFhirDocumentReferenceToTreatmentEvolutionReport(created);
}

export async function listTreatmentEvolutionReportsByPatientId(
  patientId: string,
): Promise<TreatmentEvolutionReport[]> {
  if (!patientId.trim()) {
    return [];
  }

  const query = buildDocumentReferenceBySubjectQuery(patientId);
  const bundle = await fhirClient.get<FhirBundle<FhirDocumentReference>>(buildSearchPath("DocumentReference", query));
  const resources = extractResourcesByType<FhirDocumentReference>(bundle, "DocumentReference");

  return resources
    .map(mapFhirDocumentReferenceToTreatmentEvolutionReport)
    .filter((report) => report.id.trim().length > 0);
}
