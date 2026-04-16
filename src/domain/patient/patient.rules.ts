import { PATIENT_OPERATIONAL_STATUSES } from "@/domain/patient/patient.constants";
import type { Patient, PatientOperationalStatus } from "@/domain/patient/patient.types";

export type PatientRuleFailureReason = "missing_first_name" | "missing_last_name" | "missing_dni";

export type PatientRuleResult =
  | { ok: true }
  | {
      ok: false;
      reason: PatientRuleFailureReason;
      message: string;
    };

export function canCreatePatient(input: Pick<Patient, "firstName" | "lastName">): PatientRuleResult {
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();

  if (!firstName) {
    return {
      ok: false,
      reason: "missing_first_name",
      message: "No se puede crear paciente sin nombre.",
    };
  }

  if (!lastName) {
    return {
      ok: false,
      reason: "missing_last_name",
      message: "No se puede crear paciente sin apellido.",
    };
  }

  return { ok: true };
}

export function hasRequiredIdentityForEpisode(patient: Pick<Patient, "dni">): PatientRuleResult {
  const normalizedDni = patient.dni?.trim();

  if (!normalizedDni) {
    return {
      ok: false,
      reason: "missing_dni",
      message: "Para iniciar tratamiento el paciente debe tener DNI.",
    };
  }

  return { ok: true };
}

export function getPatientOperationalStatus(options: {
  patient: Pick<Patient, "dni">;
  hasActiveEpisode: boolean;
}): PatientOperationalStatus {
  if (options.hasActiveEpisode) {
    return PATIENT_OPERATIONAL_STATUSES.ACTIVE_TREATMENT;
  }

  if (options.patient.dni?.trim()) {
    return PATIENT_OPERATIONAL_STATUSES.READY_TO_START;
  }

  return PATIENT_OPERATIONAL_STATUSES.PRELIMINARY;
}
