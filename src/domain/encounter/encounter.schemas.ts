import { normalizeToFhirDateTime } from "@/lib/fhir/date-time";

import type {
  CreateEncounterInput,
  EncounterClinicalNote,
  UpdateEncounterPeriodInput,
} from "@/domain/encounter/encounter.types";
import { functionalObservationInputSchema } from "@/domain/functional-observation/functional-observation.schemas";
import type { FunctionalObservationInput } from "@/domain/functional-observation/functional-observation.types";

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

function parseClinicalNote(value: unknown): EncounterClinicalNote | undefined {
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "object") {
    throw new Error("clinicalNote: se esperaba un objeto.");
  }

  const record = value as Record<string, unknown>;
  const clinicalNote: EncounterClinicalNote = {
    subjective: normalizeOptionalString(record.subjective, "clinicalNote.subjective"),
    objective: normalizeOptionalString(record.objective, "clinicalNote.objective"),
    intervention: normalizeOptionalString(record.intervention, "clinicalNote.intervention"),
    assessment: normalizeOptionalString(record.assessment, "clinicalNote.assessment"),
    tolerance: normalizeOptionalString(record.tolerance, "clinicalNote.tolerance"),
    homeInstructions: normalizeOptionalString(record.homeInstructions, "clinicalNote.homeInstructions"),
    nextPlan: normalizeOptionalString(record.nextPlan, "clinicalNote.nextPlan"),
  };

  const hasAnyField = Object.values(clinicalNote).some((field) => Boolean(field));
  return hasAnyField ? clinicalNote : undefined;
}

function normalizeOptionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) throw new Error(`${field}: debe ser un número.`);
  return parsed;
}

function parseFunctionalObservations(record: Record<string, unknown>, patientId: string, startedAt: string): FunctionalObservationInput[] | undefined {
  const tugSeconds = normalizeOptionalNumber(record.tugSeconds, "tugSeconds");
  const painNrs010 = normalizeOptionalNumber(record.painNrs010, "painNrs010");
  const standingToleranceMinutes = normalizeOptionalNumber(record.standingToleranceMinutes, "standingToleranceMinutes");
  const observations: FunctionalObservationInput[] = [];
  if (typeof tugSeconds !== "undefined") observations.push(functionalObservationInputSchema.parse({ patientId, encounterId: "__PENDING__", effectiveDateTime: startedAt, code: "tug_seconds", value: tugSeconds }));
  if (typeof painNrs010 !== "undefined") observations.push(functionalObservationInputSchema.parse({ patientId, encounterId: "__PENDING__", effectiveDateTime: startedAt, code: "pain_nrs_0_10", value: painNrs010 }));
  if (typeof standingToleranceMinutes !== "undefined") observations.push(functionalObservationInputSchema.parse({ patientId, encounterId: "__PENDING__", effectiveDateTime: startedAt, code: "standing_tolerance_minutes", value: standingToleranceMinutes }));
  return observations.length > 0 ? observations : undefined;
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
    const patientId = normalizeRequiredString(record.patientId, "patientId");
    const episodeOfCareId = normalizeRequiredString(record.episodeOfCareId, "episodeOfCareId");
    const normalizedEndedAt = normalizeOptionalString(record.endedAt, "endedAt");

    if (!normalizedEndedAt) {
      throw new Error("endedAt: es obligatorio.");
    }

    const endedAt = normalizeToFhirDateTime(normalizedEndedAt, "endedAt");
    ensureEndedAtAfterStartedAt(startedAt, endedAt);

    return {
      patientId,
      episodeOfCareId,
      startedAt,
      endedAt,
      clinicalNote: parseClinicalNote(record.clinicalNote),
      functionalObservations: parseFunctionalObservations(record, patientId, startedAt),
    };
  },
};

export const updateEncounterPeriodSchema = {
  parse(input: unknown): UpdateEncounterPeriodInput {
    const record = assertObject(input, "updateEncounterPeriodSchema");
    const normalizedStartedAt = normalizeOptionalString(record.startedAt, "startedAt");
    const normalizedOccurrenceDate = normalizeOptionalString(record.occurrenceDate, "occurrenceDate");
    const startedAtRaw = normalizedStartedAt ?? normalizedOccurrenceDate;

    if (!startedAtRaw) {
      throw new Error("startedAt: es obligatorio.");
    }

    const normalizedEndedAt = normalizeOptionalString(record.endedAt, "endedAt");

    if (!normalizedEndedAt) {
      throw new Error("endedAt: es obligatorio.");
    }

    const startedAt = normalizeToFhirDateTime(startedAtRaw, "startedAt");
    const endedAt = normalizeToFhirDateTime(normalizedEndedAt, "endedAt");
    ensureEndedAtAfterStartedAt(startedAt, endedAt);

    return {
      encounterId: normalizeRequiredString(record.encounterId, "encounterId"),
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      startedAt,
      endedAt,
    };
  },
};
