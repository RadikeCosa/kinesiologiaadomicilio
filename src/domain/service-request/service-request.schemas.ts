import { normalizePersonName } from "@/lib/patient-admin-display";
import type {
  CreateServiceRequestInput,
  ServiceRequestRequesterType,
  ServiceRequestStatus,
  UpdateServiceRequestStatusInput,
} from "@/domain/service-request/service-request.types";

const VALID_SERVICE_REQUEST_STATUSES: ServiceRequestStatus[] = [
  "in_review",
  "accepted",
  "closed_without_treatment",
  "cancelled",
  "entered_in_error",
];

const VALID_SERVICE_REQUEST_REQUESTER_TYPES: ServiceRequestRequesterType[] = [
  "patient",
  "family",
  "caregiver",
  "physician",
  "other",
];

const CLOSED_STATUSES_REQUIRING_REASON: ServiceRequestStatus[] = ["closed_without_treatment", "cancelled"];

function assertObject(input: unknown, schemaName: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    throw new Error(`${schemaName}: se esperaba un objeto.`);
  }

  return input as Record<string, unknown>;
}

function normalizeRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`${field}: debe ser un string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field}: es obligatorio.`);
  }

  return normalized;
}

function normalizeOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${field}: debe ser un string.`);
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

function normalizeRequiredIsoDate(value: unknown, field: string): string {
  const normalized = normalizeRequiredString(value, field);

  if (!isValidIsoDate(normalized)) {
    throw new Error(`${field}: formato inválido (YYYY-MM-DD).`);
  }

  return normalized;
}

function normalizeOptionalRequesterType(value: unknown, field: string): ServiceRequestRequesterType | undefined {
  const normalized = normalizeOptionalString(value, field);

  if (normalized === undefined) {
    return undefined;
  }

  if (!VALID_SERVICE_REQUEST_REQUESTER_TYPES.includes(normalized as ServiceRequestRequesterType)) {
    throw new Error(`${field}: valor inválido.`);
  }

  return normalized as ServiceRequestRequesterType;
}

function normalizeRequiredStatus(value: unknown, field: string): ServiceRequestStatus {
  const normalized = normalizeRequiredString(value, field);

  if (!VALID_SERVICE_REQUEST_STATUSES.includes(normalized as ServiceRequestStatus)) {
    throw new Error(`${field}: valor inválido.`);
  }

  return normalized as ServiceRequestStatus;
}

export const createServiceRequestSchema = {
  parse(input: unknown): CreateServiceRequestInput {
    const record = assertObject(input, "createServiceRequestSchema");

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      requestedAt: normalizeRequiredIsoDate(record.requestedAt, "requestedAt"),
      requesterDisplay: (() => {
        const normalizedRequesterDisplay = normalizeOptionalString(record.requesterDisplay, "requesterDisplay");
        return normalizedRequesterDisplay === undefined ? undefined : normalizePersonName(normalizedRequesterDisplay);
      })(),
      requesterType: normalizeOptionalRequesterType(record.requesterType, "requesterType"),
      requesterContact: normalizeOptionalString(record.requesterContact, "requesterContact"),
      reasonText: normalizeRequiredString(record.reasonText, "reasonText"),
      reportedDiagnosisText: normalizeOptionalString(record.reportedDiagnosisText, "reportedDiagnosisText"),
      notes: normalizeOptionalString(record.notes, "notes"),
    };
  },
};

export const updateServiceRequestStatusSchema = {
  parse(input: unknown): UpdateServiceRequestStatusInput {
    const record = assertObject(input, "updateServiceRequestStatusSchema");
    const status = normalizeRequiredStatus(record.status, "status");
    const closedReasonText = normalizeOptionalString(record.closedReasonText, "closedReasonText");

    if (CLOSED_STATUSES_REQUIRING_REASON.includes(status) && !closedReasonText) {
      throw new Error("closedReasonText: es obligatorio para closed_without_treatment/cancelled.");
    }

    return {
      id: normalizeRequiredString(record.id, "id"),
      status,
      closedReasonText,
    };
  },
};
