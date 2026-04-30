import type { PatientOperationalStatus } from "@/domain/patient/patient.types";
import type { ServiceRequestStatus } from "@/domain/service-request/service-request.types";
import { calculateAgeFromBirthDate } from "@/lib/patient-admin-display";

import type {
  AdminAgeSummary,
  AdminDashboardReadModel,
  AdminOperationalSummary,
  AdminServiceRequestSummary,
} from "./dashboard.read-model";

interface DashboardPatientSnapshot {
  operationalStatus: PatientOperationalStatus;
  birthDate?: string;
}

interface DashboardServiceRequestSnapshot {
  id: string;
  status: ServiceRequestStatus;
}

const AGE_SUMMARY_NOTE = "Calculada sobre pacientes con tratamiento iniciado o finalizado.";

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
  const patientsWithStartedOrFinishedTreatment = patients.filter((patient) => (
    patient.operationalStatus === "active_treatment" || patient.operationalStatus === "finished_treatment"
  ));

  const validAges = patientsWithStartedOrFinishedTreatment
    .map((patient) => calculateAgeFromBirthDate(patient.birthDate, referenceDate))
    .filter((age): age is number => age !== null);

  const withValidBirthDate = validAges.length;
  const withoutValidBirthDate = patientsWithStartedOrFinishedTreatment.length - withValidBirthDate;

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
      denominator: patientsWithStartedOrFinishedTreatment.length,
      percentage: patientsWithStartedOrFinishedTreatment.length > 0
        ? Math.round((withValidBirthDate / patientsWithStartedOrFinishedTreatment.length) * 100)
        : null,
    },
    note: AGE_SUMMARY_NOTE,
  };
}

export function buildServiceRequestSummary(
  serviceRequests: DashboardServiceRequestSnapshot[],
  usedServiceRequestIds: Set<string>,
): AdminServiceRequestSummary {
  const inReview = serviceRequests.filter((serviceRequest) => serviceRequest.status === "in_review").length;
  const acceptedPendingTreatment = serviceRequests.filter((serviceRequest) => (
    serviceRequest.status === "accepted" && !usedServiceRequestIds.has(serviceRequest.id)
  )).length;

  return {
    inReview,
    acceptedPendingTreatment,
  };
}

export function buildAdminDashboardReadModel(
  patients: DashboardPatientSnapshot[],
  serviceRequestSummary: AdminServiceRequestSummary,
  referenceDate: Date = new Date(),
): AdminDashboardReadModel {
  return {
    generatedAt: referenceDate.toISOString(),
    operationalSummary: buildOperationalSummary(patients),
    ageSummary: buildPatientAgeSummary(patients, referenceDate),
    serviceRequestSummary,
  };
}
