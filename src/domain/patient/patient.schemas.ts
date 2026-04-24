import type { CreatePatientInput, MainContact, PatientGender, UpdatePatientInput } from "@/domain/patient/patient.types";
import { normalizeMainContactRelationship } from "@/domain/patient/contact-relationship";
import { normalizeDni, normalizePhone } from "@/lib/patient-admin-display";

const VALID_PATIENT_GENDERS: PatientGender[] = ["male", "female", "other", "unknown"];

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
    relationship: normalizeMainContactRelationship(normalizeOptionalString(record.relationship, "mainContact.relationship")),
    phone: normalizeOptionalString(record.phone, "mainContact.phone"),
  };
}

function normalizeOptionalPatientGender(value: unknown, field: string): PatientGender | undefined {
  const normalized = normalizeOptionalString(value, field);

  if (normalized === undefined) {
    return undefined;
  }

  if (!VALID_PATIENT_GENDERS.includes(normalized as PatientGender)) {
    throw new Error(`${field}: valor inválido.`);
  }

  return normalized as PatientGender;
}

function normalizeOptionalDni(value: unknown, field: string): string | undefined {
  const normalizedInput = normalizeOptionalString(value, field);

  if (normalizedInput === undefined) {
    return undefined;
  }

  const normalizedDni = normalizeDni(normalizedInput);

  if (!normalizedDni) {
    throw new Error(`${field}: formato inválido.`);
  }

  if (normalizedDni.length < 7 || normalizedDni.length > 8) {
    throw new Error(`${field}: longitud inválida (7 u 8 dígitos).`);
  }

  return normalizedDni;
}

function normalizeOptionalPhone(value: unknown, field: string): string | undefined {
  const normalizedInput = normalizeOptionalString(value, field);

  if (normalizedInput === undefined) {
    return undefined;
  }

  const normalizedPhone = normalizePhone(normalizedInput);
  const digits = normalizedPhone.replace(/\D+/g, "");

  if (!digits) {
    throw new Error(`${field}: formato inválido.`);
  }

  if (digits.length < 10 || digits.length > 15) {
    throw new Error(`${field}: longitud inválida (10 a 15 dígitos).`);
  }

  return normalizedPhone;
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

function normalizeOptionalBirthDate(value: unknown, field: string): string | undefined {
  const normalized = normalizeOptionalString(value, field);

  if (normalized === undefined) {
    return undefined;
  }

  if (!isValidIsoDate(normalized)) {
    throw new Error(`${field}: formato inválido (YYYY-MM-DD).`);
  }

  return normalized;
}

export const createPatientSchema = {
  parse(input: unknown): CreatePatientInput {
    const record = assertObject(input, "createPatientSchema");

    return {
      firstName: normalizeRequiredString(record.firstName, "firstName"),
      lastName: normalizeRequiredString(record.lastName, "lastName"),
      dni: normalizeOptionalDni(record.dni, "dni"),
      phone: normalizeOptionalPhone(record.phone, "phone"),
      gender: normalizeOptionalPatientGender(record.gender, "gender"),
      birthDate: normalizeOptionalBirthDate(record.birthDate, "birthDate"),
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
      dni: normalizeOptionalDni(record.dni, "dni"),
      phone: normalizeOptionalPhone(record.phone, "phone"),
      gender: normalizeOptionalPatientGender(record.gender, "gender"),
      birthDate: normalizeOptionalBirthDate(record.birthDate, "birthDate"),
      address: normalizeOptionalString(record.address, "address"),
      mainContact: normalizeMainContact(record.mainContact),
    };
  },
};
