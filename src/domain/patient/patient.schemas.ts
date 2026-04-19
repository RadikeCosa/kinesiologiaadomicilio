import type { CreatePatientInput, MainContact, UpdatePatientInput } from "@/domain/patient/patient.types";

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

function normalizeMainContact(value: unknown): MainContact | undefined {
  if (value === undefined) {
    return undefined;
  }

  const record = assertObject(value, "mainContact");

  return {
    name: normalizeOptionalString(record.name, "mainContact.name"),
    relationship: normalizeOptionalString(record.relationship, "mainContact.relationship"),
    phone: normalizeOptionalString(record.phone, "mainContact.phone"),
  };
}

export const createPatientSchema = {
  parse(input: unknown): CreatePatientInput {
    const record = assertObject(input, "createPatientSchema");

    return {
      firstName: normalizeRequiredString(record.firstName, "firstName"),
      lastName: normalizeRequiredString(record.lastName, "lastName"),
      dni: normalizeOptionalString(record.dni, "dni"),
      phone: normalizeOptionalString(record.phone, "phone"),
      birthDate: normalizeOptionalString(record.birthDate, "birthDate"),
      address: normalizeOptionalString(record.address, "address"),
      mainContact: normalizeMainContact(record.mainContact),
    };
  },
};

export const updatePatientSchema = {
  parse(input: unknown): UpdatePatientInput {
    const record = assertObject(input, "updatePatientSchema");

    return {
      id: normalizeRequiredString(record.id, "id"),
      firstName: normalizeOptionalString(record.firstName, "firstName"),
      lastName: normalizeOptionalString(record.lastName, "lastName"),
      dni: normalizeOptionalString(record.dni, "dni"),
      phone: normalizeOptionalString(record.phone, "phone"),
      birthDate: normalizeOptionalString(record.birthDate, "birthDate"),
      address: normalizeOptionalString(record.address, "address"),
      mainContact: normalizeMainContact(record.mainContact),
    };
  },
};
