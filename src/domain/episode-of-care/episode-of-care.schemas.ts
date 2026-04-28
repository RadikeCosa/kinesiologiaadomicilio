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

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

export const startEpisodeOfCareSchema = {
  parse(input: unknown): StartEpisodeOfCareInput {
    const record = assertObject(input, "startEpisodeOfCareSchema");

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      startDate: normalizeRequiredIsoDate(record.startDate, "startDate"),
      serviceRequestId: normalizeOptionalString(record.serviceRequestId),
    };
  },
};
export const finishEpisodeOfCareSchema = {
  parse(input: unknown): FinishEpisodeOfCareInput {
    const record = assertObject(input, "finishEpisodeOfCareSchema");

    return {
      patientId: normalizeRequiredString(record.patientId, "patientId"),
      endDate: normalizeRequiredIsoDate(record.endDate, "endDate"),
    };
  },
};
