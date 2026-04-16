import type { CreatePatientInput, UpdatePatientInput } from "@/domain/patient/patient.types";

export type PatientWritePayload = {
  // TODO(slice-1/fase-2): definir payload real al integrar FHIR.
  placeholder: true;
  input: CreatePatientInput | UpdatePatientInput;
};

export function mapPatientInputToWritePayload(
  input: CreatePatientInput | UpdatePatientInput,
): PatientWritePayload {
  return {
    placeholder: true,
    input,
  };
}
