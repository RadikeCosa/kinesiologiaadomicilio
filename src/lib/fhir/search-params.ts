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


export function buildEpisodeOfCareByPatientIdsQuery(patientIds: string[]): string {
  const normalizedPatientReferences = Array.from(
    new Set(
      patientIds
        .map((patientId) => extractIdFromReference(patientId) ?? patientId)
        .map((patientId) => patientId.trim())
        .filter(Boolean)
        .map((patientId) => buildPatientReference(patientId)),
    ),
  );

  if (!normalizedPatientReferences.length) {
    return "";
  }

  const params = new URLSearchParams({
    patient: normalizedPatientReferences.join(","),
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

export function buildEncounterByPatientQuery(patientId: string, options?: { count?: number }): string {
  const params = new URLSearchParams({
    subject: buildPatientReference(patientId),
    _sort: "-date",
  });

  if (options?.count) {
    params.set("_count", String(options.count));
  }

  return params.toString();
}


export function buildServiceRequestBySubjectQuery(patientId: string): string {
  const params = new URLSearchParams({
    subject: buildPatientReference(patientId),
  });

  return params.toString();
}

export function buildDocumentReferenceBySubjectQuery(patientId: string): string {
  const params = new URLSearchParams({
    subject: buildPatientReference(patientId),
  });

  return params.toString();
}


export function buildServiceRequestBySubjectIdsQuery(patientIds: string[]): string {
  const normalizedPatientReferences = Array.from(
    new Set(
      patientIds
        .map((patientId) => extractIdFromReference(patientId) ?? patientId)
        .map((patientId) => patientId.trim())
        .filter(Boolean)
        .map((patientId) => buildPatientReference(patientId)),
    ),
  );

  if (!normalizedPatientReferences.length) {
    return "";
  }

  const params = new URLSearchParams({
    subject: normalizedPatientReferences.join(","),
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

export function buildEpisodeOfCareByIncomingReferralIdsQuery(serviceRequestIds: string[]): string {
  const normalizedServiceRequestReferences = Array.from(
    new Set(
      serviceRequestIds
        .map((serviceRequestId) => extractIdFromReference(serviceRequestId) ?? serviceRequestId)
        .map((serviceRequestId) => serviceRequestId.trim())
        .filter(Boolean)
        .map((serviceRequestId) => `ServiceRequest/${serviceRequestId}`),
    ),
  );

  if (!normalizedServiceRequestReferences.length) {
    return "";
  }

  const params = new URLSearchParams({
    "incoming-referral": normalizedServiceRequestReferences.join(","),
  });

  return params.toString();
}

export function buildPractitionerByIdentifierQuery(input: { system: string; value: string }): string {
  const system = input.system.trim();
  const value = input.value.trim();

  if (!system || !value) {
    return "";
  }

  const params = new URLSearchParams({
    identifier: `${system}|${value}`,
  });

  return params.toString();
}
