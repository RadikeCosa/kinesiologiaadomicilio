import type { ServiceRequest } from "@/domain/service-request/service-request.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import { type FhirServiceRequest } from "@/infrastructure/mappers/service-request/service-request-fhir.types";

const NOTE_PREFIXES = {
  reportedDiagnosis: "reported-diagnosis:v1:",
  requesterContact: "requester-contact:v1:",
  generalNote: "general-note:v1:",
  workflowStatus: "workflow-status:v1:",
} as const;

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function extractTaggedNoteValue(note: FhirServiceRequest["note"], prefix: string): string | undefined {
  if (!note?.length) {
    return undefined;
  }

  for (const entry of note) {
    const text = normalizeOptionalString(entry.text);

    if (!text || !text.startsWith(prefix)) {
      continue;
    }

    const value = text.slice(prefix.length).trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

function findFirstReasonText(reasonCode?: FhirServiceRequest["reasonCode"]): string {
  if (!reasonCode?.length) {
    return "";
  }

  for (const reason of reasonCode) {
    const text = normalizeOptionalString(reason.text);

    if (text) {
      return text;
    }
  }

  return "";
}

function extractClosedReasonText(statusReason?: FhirServiceRequest["statusReason"]): string | undefined {
  const statusReasonText = normalizeOptionalString(statusReason?.text);
  if (statusReasonText) {
    return statusReasonText;
  }

  const coding = statusReason?.coding;
  if (!coding?.length) {
    return undefined;
  }

  for (const item of coding) {
    const displayText = normalizeOptionalString(item.display);
    if (displayText) {
      return displayText;
    }

    const codedText = normalizeOptionalString(item.text);
    if (codedText) {
      return codedText;
    }
  }

  return undefined;
}

function resolveRevokedDomainStatus(resource: Pick<FhirServiceRequest, "statusReason" | "note">): ServiceRequest["status"] {
  const statusReasonText = normalizeOptionalString(resource.statusReason?.text)?.toLowerCase();
  const noteText = resource.note
    ?.map((entry) => normalizeOptionalString(entry.text)?.toLowerCase())
    .filter((text): text is string => Boolean(text))
    .join(" |");

  const combinedSignals = [statusReasonText, noteText].filter(Boolean).join(" |");

  if (combinedSignals.includes("cancel")) {
    return "cancelled";
  }

  return "closed_without_treatment";
}

function resolveActiveDomainStatus(resource: Pick<FhirServiceRequest, "note">): ServiceRequest["status"] {
  if (!resource.note?.length) {
    return "in_review";
  }

  for (const entry of resource.note) {
    const text = normalizeOptionalString(entry.text);

    if (!text || !text.startsWith(NOTE_PREFIXES.workflowStatus)) {
      continue;
    }

    const workflowStatus = text.slice(NOTE_PREFIXES.workflowStatus.length).trim();
    return workflowStatus === "accepted" ? "accepted" : "in_review";
  }

  return "in_review";
}

export function mapFhirServiceRequestStatusToDomainStatus(resource: Pick<FhirServiceRequest, "status" | "statusReason" | "note">): ServiceRequest["status"] {
  switch (resource.status) {
    case "active":
      return resolveActiveDomainStatus(resource);
    case "revoked":
      // Política explícita: sin señal concluyente, revoked -> closed_without_treatment.
      return resolveRevokedDomainStatus(resource);
    case "entered-in-error":
      return "entered_in_error";
    default:
      return "in_review";
  }
}

export function extractServiceRequestNoteFields(note: FhirServiceRequest["note"]): Pick<
  ServiceRequest,
  "reportedDiagnosisText" | "requesterContact" | "notes"
> {
  return {
    reportedDiagnosisText: extractTaggedNoteValue(note, NOTE_PREFIXES.reportedDiagnosis),
    requesterContact: extractTaggedNoteValue(note, NOTE_PREFIXES.requesterContact),
    notes: extractTaggedNoteValue(note, NOTE_PREFIXES.generalNote),
  };
}

export function mapFhirServiceRequestToDomain(resource: FhirServiceRequest): ServiceRequest {
  const noteFields = extractServiceRequestNoteFields(resource.note);

  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.subject?.reference) ?? "",
    requestedAt: normalizeOptionalString(resource.authoredOn) ?? "",
    requesterDisplay: normalizeOptionalString(resource.requester?.display),
    reasonText: findFirstReasonText(resource.reasonCode),
    status: mapFhirServiceRequestStatusToDomainStatus(resource),
    closedReasonText: extractClosedReasonText(resource.statusReason),
    reportedDiagnosisText: noteFields.reportedDiagnosisText,
    requesterContact: noteFields.requesterContact,
    notes: noteFields.notes,
  };
}
