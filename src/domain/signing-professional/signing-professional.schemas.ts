import { z } from "zod";

import type { UpsertSigningProfessionalInput } from "@/domain/signing-professional/signing-professional.types";

const FULL_NAME_MAX_LENGTH = 160;
const ROLE_TITLE_MAX_LENGTH = 120;
const LICENSE_NUMBER_MAX_LENGTH = 80;
const LICENSE_JURISDICTION_MAX_LENGTH = 160;
const SIGNATURE_DISPLAY_MAX_LENGTH = 240;
const PROFESSIONAL_PHONE_MAX_LENGTH = 60;

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeRequiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new Error(`${field}: debe ser un string.`);
  }

  const normalized = normalizeText(value);

  if (!normalized) {
    throw new Error(`${field}: es obligatorio.`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${field}: debe tener ${maxLength} caracteres o menos.`);
  }

  return normalized;
}

function normalizeOptionalText(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${field}: debe ser un string.`);
  }

  const normalized = normalizeText(value);

  if (!normalized) {
    return undefined;
  }

  if (normalized.length > maxLength) {
    throw new Error(`${field}: debe tener ${maxLength} caracteres o menos.`);
  }

  return normalized;
}

function assertObject(input: unknown, schemaName: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    throw new Error(`${schemaName}: se esperaba un objeto.`);
  }

  return input as Record<string, unknown>;
}

const upsertSigningProfessionalZodSchema = z.object({
  fullName: z.string(),
  roleTitle: z.string(),
  licenseNumber: z.string().optional(),
  licenseJurisdiction: z.string().optional(),
  signatureDisplay: z.string().optional(),
  professionalPhone: z.string().optional(),
});

export const upsertSigningProfessionalSchema = {
  parse(input: unknown): UpsertSigningProfessionalInput {
    const record = assertObject(input, "upsertSigningProfessionalSchema");
    upsertSigningProfessionalZodSchema.parse(record);

    return {
      fullName: normalizeRequiredText(record.fullName, "fullName", FULL_NAME_MAX_LENGTH),
      roleTitle: normalizeRequiredText(record.roleTitle, "roleTitle", ROLE_TITLE_MAX_LENGTH),
      licenseNumber: normalizeOptionalText(record.licenseNumber, "licenseNumber", LICENSE_NUMBER_MAX_LENGTH),
      licenseJurisdiction: normalizeOptionalText(record.licenseJurisdiction, "licenseJurisdiction", LICENSE_JURISDICTION_MAX_LENGTH),
      signatureDisplay: normalizeOptionalText(record.signatureDisplay, "signatureDisplay", SIGNATURE_DISPLAY_MAX_LENGTH),
      professionalPhone: normalizeOptionalText(record.professionalPhone, "professionalPhone", PROFESSIONAL_PHONE_MAX_LENGTH),
    };
  },
};

export const signingProfessionalSchemas = {
  upsertSigningProfessionalSchema,
};
