import { buildDniIdentifier, formatIdentifierSearchValue } from "@/lib/fhir/identifiers";
import { buildPatientReference, extractIdFromReference } from "@/lib/fhir/references";

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

export function buildEpisodeOfCareByPatientQuery(patientId: string): string {
  const params = new URLSearchParams({
    patient: buildPatientReference(patientId),
  });

  return params.toString();
}

export function buildActiveEpisodeOfCareByPatientQuery(patientId: string): string {
  const params = new URLSearchParams({
    patient: buildPatientReference(patientId),
    status: "active",
  });

  return params.toString();
}

export function buildEncounterByPatientQuery(patientId: string): string {
  const params = new URLSearchParams({
    subject: buildPatientReference(patientId),
  });

  return params.toString();
}


export function buildServiceRequestBySubjectQuery(patientId: string): string {
  const params = new URLSearchParams({
    subject: buildPatientReference(patientId),
  });

  return params.toString();
}

export function buildEpisodeOfCareByIncomingReferralQuery(serviceRequestId: string): string {
  const normalizedServiceRequestId = extractIdFromReference(serviceRequestId) ?? serviceRequestId;
  const params = new URLSearchParams({
    "incoming-referral": `ServiceRequest/${normalizedServiceRequestId}`,
  });

  return params.toString();
}
