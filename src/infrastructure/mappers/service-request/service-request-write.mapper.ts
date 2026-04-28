import type { CreateServiceRequestInput, ServiceRequestStatus } from "@/domain/service-request/service-request.types";
import { buildPatientReference } from "@/lib/fhir/references";

import { type FhirServiceRequest } from "@/infrastructure/mappers/service-request/service-request-fhir.types";

const NOTE_PREFIXES = {
  reportedDiagnosis: "reported-diagnosis:v1:",
  requesterContact: "requester-contact:v1:",
  generalNote: "general-note:v1:",
} as const;

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function buildTaggedNote(prefix: string, value?: string): { text: string } | null {
  const normalizedValue = normalizeOptionalString(value);

  if (!normalizedValue) {
    return null;
  }

  return {
    text: `${prefix}${normalizedValue}`,
  };
}

export function buildServiceRequestNotes(input: {
  reportedDiagnosisText?: string;
  requesterContact?: string;
  notes?: string;
}): FhirServiceRequest["note"] {
  const entries = [
    buildTaggedNote(NOTE_PREFIXES.reportedDiagnosis, input.reportedDiagnosisText),
    buildTaggedNote(NOTE_PREFIXES.requesterContact, input.requesterContact),
    buildTaggedNote(NOTE_PREFIXES.generalNote, input.notes),
  ].filter((entry): entry is { text: string } => Boolean(entry));

  return entries.length ? entries : undefined;
}

export function mapServiceRequestStatusToFhirStatus(status: ServiceRequestStatus): FhirServiceRequest["status"] {
  switch (status) {
    case "in_review":
    case "accepted":
      return "active";
    case "closed_without_treatment":
    case "cancelled":
      return "revoked";
    case "entered_in_error":
      return "entered-in-error";
    default:
      return "active";
  }
}

export function mapCreateServiceRequestInputToFhir(input: CreateServiceRequestInput): FhirServiceRequest {
  const requesterDisplay = normalizeOptionalString(input.requesterDisplay);

  return {
    resourceType: "ServiceRequest",
    status: mapServiceRequestStatusToFhirStatus("in_review"),
    intent: "order",
    subject: {
      reference: buildPatientReference(input.patientId),
    },
    authoredOn: input.requestedAt,
    reasonCode: [{ text: input.reasonText }],
    requester: requesterDisplay
      ? {
        display: requesterDisplay,
      }
      : undefined,
    note: buildServiceRequestNotes({
      reportedDiagnosisText: input.reportedDiagnosisText,
      requesterContact: input.requesterContact,
      notes: input.notes,
    }),
  };
}
