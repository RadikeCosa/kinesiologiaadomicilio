import type { StartEpisodeOfCareInput } from "@/domain/episode-of-care/episode-of-care.types";

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

export const startEpisodeOfCareSchema = {
  parse(input: unknown): StartEpisodeOfCareInput {
    const record = assertObject(input, "startEpisodeOfCareSchema");

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      startDate: normalizeRequiredString(record.startDate, "startDate"),
      description: normalizeOptionalString(record.description, "description"),
    };
  },
};
