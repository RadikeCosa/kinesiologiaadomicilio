import type { PatientOperationalStatus } from "@/domain/patient/patient.types";
import { calculateAgeFromBirthDate } from "@/lib/patient-admin-display";

import type { AdminAgeSummary, AdminDashboardReadModel, AdminOperationalSummary } from "./dashboard.read-model";

interface DashboardPatientSnapshot {
  operationalStatus: PatientOperationalStatus;
  birthDate?: string;
}

const AGE_SUMMARY_NOTE = "La edad se calcula únicamente sobre pacientes con fecha de nacimiento válida.";

export function buildOperationalSummary(
  patients: DashboardPatientSnapshot[],
): AdminOperationalSummary {
  const preliminary = patients.filter((patient) => patient.operationalStatus === "preliminary").length;
  const readyToStart = patients.filter((patient) => patient.operationalStatus === "ready_to_start").length;
  const activeTreatment = patients.filter((patient) => patient.operationalStatus === "active_treatment").length;
  const finishedTreatment = patients.filter((patient) => patient.operationalStatus === "finished_treatment").length;

  return {
    totalPatients: patients.length,
    activeTreatment,
    finishedTreatment,
    withoutStartedTreatment: preliminary + readyToStart,
    preliminary,
    readyToStart,
  };
}

export function buildPatientAgeSummary(
  patients: DashboardPatientSnapshot[],
  referenceDate: Date = new Date(),
): AdminAgeSummary {
  const validAges = patients
    .map((patient) => calculateAgeFromBirthDate(patient.birthDate, referenceDate))
    .filter((age): age is number => age !== null);

  const withValidBirthDate = validAges.length;
  const withoutValidBirthDate = patients.length - withValidBirthDate;

  const youngest = withValidBirthDate > 0 ? Math.min(...validAges) : null;
  const oldest = withValidBirthDate > 0 ? Math.max(...validAges) : null;
  const average = withValidBirthDate > 0
    ? Math.round(validAges.reduce((total, age) => total + age, 0) / withValidBirthDate)
    : null;

  return {
    youngest,
    oldest,
    average,
    withValidBirthDate,
    withoutValidBirthDate,
    coverage: {
      numerator: withValidBirthDate,
      denominator: patients.length,
      percentage: patients.length > 0
        ? Math.round((withValidBirthDate / patients.length) * 100)
        : null,
    },
    note: AGE_SUMMARY_NOTE,
  };
}

export function buildAdminDashboardReadModel(
  patients: DashboardPatientSnapshot[],
  referenceDate: Date = new Date(),
): AdminDashboardReadModel {
  return {
    generatedAt: referenceDate.toISOString(),
    operationalSummary: buildOperationalSummary(patients),
    ageSummary: buildPatientAgeSummary(patients, referenceDate),
  };
}
