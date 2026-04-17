import type { CreateEncounterInput } from "@/domain/encounter/encounter.types";

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

export const createEncounterSchema = {
  parse(input: unknown): CreateEncounterInput {
    const record = assertObject(input, "createEncounterSchema");

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      episodeOfCareId: normalizeRequiredString(record.episodeOfCareId, "episodeOfCareId"),
      occurrenceDate: normalizeRequiredString(record.occurrenceDate, "occurrenceDate"),
    };
  },
};
