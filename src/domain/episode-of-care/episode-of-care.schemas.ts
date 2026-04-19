import type {
  FinishEpisodeOfCareInput,
  StartEpisodeOfCareInput,
} from "@/domain/episode-of-care/episode-of-care.types";

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

export const startEpisodeOfCareSchema = {
  parse(input: unknown): StartEpisodeOfCareInput {
    const record = assertObject(input, "startEpisodeOfCareSchema");

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      startDate: normalizeRequiredString(record.startDate, "startDate"),
    };
  },
};
export const finishEpisodeOfCareSchema = {
  parse(input: unknown): FinishEpisodeOfCareInput {
    const record = assertObject(input, "finishEpisodeOfCareSchema");

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      endDate: normalizeRequiredString(record.endDate, "endDate"),
    };
  },
};
