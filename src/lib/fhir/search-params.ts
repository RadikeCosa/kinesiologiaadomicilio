import { buildDniIdentifier, formatIdentifierSearchValue } from "@/lib/fhir/identifiers";
import { buildPatientReference } from "@/lib/fhir/references";

export function buildPatientSearchByDniQuery(dni: string): string {
  const params = new URLSearchParams({
    identifier: formatIdentifierSearchValue(buildDniIdentifier(dni)),
  });

  return params.toString();
}

export function buildPatientListQuery(params?: { count?: number }): string {
  const searchParams = new URLSearchParams();

  if (params?.count) {
    searchParams.set("_count", String(params.count));
  }

  return searchParams.toString();
}

export function buildActiveEpisodeOfCareByPatientQuery(patientId: string): string {
  const params = new URLSearchParams({
    patient: buildPatientReference(patientId),
    status: "active",
  });

  return params.toString();
}
