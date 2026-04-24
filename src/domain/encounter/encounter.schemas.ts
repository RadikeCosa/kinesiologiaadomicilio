import { normalizeToFhirDateTime } from "@/lib/fhir/date-time";

import type { CreateEncounterInput, UpdateEncounterStartInput } from "@/domain/encounter/encounter.types";

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
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${field}: debe ser un string.`);
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function ensureEndedAtAfterStartedAt(startedAt: string, endedAt: string): void {
  const startedAtTimestamp = new Date(startedAt).getTime();
  const endedAtTimestamp = new Date(endedAt).getTime();

  if (Number.isNaN(startedAtTimestamp) || Number.isNaN(endedAtTimestamp)) {
    throw new Error("endedAt: formato dateTime inválido.");
  }

  if (endedAtTimestamp < startedAtTimestamp) {
    throw new Error("endedAt: debe ser igual o posterior al inicio.");
  }
}

export const createEncounterSchema = {
  parse(input: unknown): CreateEncounterInput {
    const record = assertObject(input, "createEncounterSchema");
    const normalizedStartedAt = normalizeOptionalString(record.startedAt, "startedAt");
    const normalizedOccurrenceDate = normalizeOptionalString(record.occurrenceDate, "occurrenceDate");
    const startedAtRaw = normalizedStartedAt ?? normalizedOccurrenceDate;

    if (!startedAtRaw) {
      throw new Error("startedAt: es obligatorio.");
    }

    const startedAt = normalizeToFhirDateTime(startedAtRaw, "startedAt");
    const normalizedEndedAt = normalizeOptionalString(record.endedAt, "endedAt");
    const endedAt = normalizedEndedAt
      ? normalizeToFhirDateTime(normalizedEndedAt, "endedAt")
      : undefined;

    if (endedAt) {
      ensureEndedAtAfterStartedAt(startedAt, endedAt);
    }

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      episodeOfCareId: normalizeRequiredString(record.episodeOfCareId, "episodeOfCareId"),
      startedAt,
      endedAt,
    };
  },
};

export const updateEncounterStartSchema = {
  parse(input: unknown): UpdateEncounterStartInput {
    const record = assertObject(input, "updateEncounterStartSchema");
    const normalizedStartedAt = normalizeOptionalString(record.startedAt, "startedAt");
    const normalizedOccurrenceDate = normalizeOptionalString(record.occurrenceDate, "occurrenceDate");
    const startedAtRaw = normalizedStartedAt ?? normalizedOccurrenceDate;

    if (!startedAtRaw) {
      throw new Error("startedAt: es obligatorio.");
    }

    return {
      encounterId: normalizeRequiredString(record.encounterId, "encounterId"),
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      startedAt: normalizeToFhirDateTime(startedAtRaw, "startedAt"),
    };
  },
};
