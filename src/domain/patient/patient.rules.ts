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

export type MinimumOperationalDataForTreatmentFailureReason =
  | "missing_patient_name"
  | "missing_patient_address"
  | "missing_contact_phone";

export type MinimumOperationalDataForTreatmentResult =
  | { ok: true }
  | {
      ok: false;
      reason: MinimumOperationalDataForTreatmentFailureReason;
      message: string;
    };

export function hasMinimumOperationalDataForTreatment(
  patient: Pick<Patient, "firstName" | "lastName" | "address" | "phone" | "mainContact">,
): MinimumOperationalDataForTreatmentResult {
  const firstName = patient.firstName?.trim();
  const lastName = patient.lastName?.trim();

  if (!firstName || !lastName) {
    return {
      ok: false,
      reason: "missing_patient_name",
      message: "Para iniciar tratamiento necesitás completar nombre y apellido del paciente.",
    };
  }

  if (!patient.address?.trim()) {
    return {
      ok: false,
      reason: "missing_patient_address",
      message: "Para iniciar tratamiento necesitás registrar el domicilio de atención del paciente.",
    };
  }

  const hasPatientPhone = Boolean(patient.phone?.trim());
  const hasMainContactPhone = Boolean(patient.mainContact?.phone?.trim());

  if (!hasPatientPhone && !hasMainContactPhone) {
    return {
      ok: false,
      reason: "missing_contact_phone",
      message: "Para iniciar tratamiento necesitás registrar un teléfono de contacto del paciente o del contacto principal.",
    };
  }

  return { ok: true };
}

export function getPatientOperationalStatus(options: {
  patient: Pick<Patient, "firstName" | "lastName" | "address" | "phone" | "mainContact">;
  hasActiveEpisode: boolean;
  hasFinishedEpisode?: boolean;
}): PatientOperationalStatus {
  if (options.hasActiveEpisode) {
    return PATIENT_OPERATIONAL_STATUSES.ACTIVE_TREATMENT;
  }

  if (options.hasFinishedEpisode) {
    return PATIENT_OPERATIONAL_STATUSES.FINISHED_TREATMENT;
  }

  if (hasMinimumOperationalDataForTreatment(options.patient).ok) {
    return PATIENT_OPERATIONAL_STATUSES.READY_TO_START;
  }

  return PATIENT_OPERATIONAL_STATUSES.PRELIMINARY;
}
