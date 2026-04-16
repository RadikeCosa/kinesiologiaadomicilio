import type { CreatePatientInput, UpdatePatientInput } from "@/domain/patient/patient.types";

export const createPatientSchema = {
  parse(input: CreatePatientInput): CreatePatientInput {
    // TODO(slice-1/fase-2): reemplazar placeholder por esquema real de validación.
    return input;
  },
};

export const updatePatientSchema = {
  parse(input: UpdatePatientInput): UpdatePatientInput {
    // TODO(slice-1/fase-2): reemplazar placeholder por esquema real de validación.
    return input;
  },
};
