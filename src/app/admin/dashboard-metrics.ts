import type { PatientOperationalStatus } from "@/domain/patient/patient.types";
import type { ServiceRequestStatus } from "@/domain/service-request/service-request.types";
import { calculateAgeFromBirthDate } from "@/lib/patient-admin-display";

import type {
  AdminAgeSummary,
  AdminDashboardReadModel,
  AdminOperationalSummary,
  AdminServiceRequestSummary,
} from "./dashboard.read-model";

export interface AdminDashboardMetricCard {
  label: string;
  value: number;
  tone: "sky" | "indigo" | "amber" | "emerald" | "slate";
  helper?: string;
  href?: string;
  ctaLabel?: string;
}

export interface AdminDashboardSection {
  title: "Requiere acción" | "En seguimiento" | "Contexto / histórico";
  description: string;
  metrics: AdminDashboardMetricCard[];
  emptyMessage?: string;
}

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

export function buildAdminDashboardSections(
  dashboard: AdminDashboardReadModel,
): AdminDashboardSection[] {
  return [
    {
      title: "Requiere acción",
      description: "Pendientes que destraban la operación o requieren decisión.",
      emptyMessage: "No hay pendientes críticos en este momento.",
      metrics: [
        {
          label: "Solicitudes en evaluación",
          value: dashboard.serviceRequestSummary.inReview,
          tone: "sky",
          helper: "Pedidos que todavía requieren revisión.",
          href: "/admin/patients?signal=in_review_requests",
          ctaLabel: "Ver pacientes",
        },
        {
          label: "Pendientes de iniciar tratamiento",
          value: dashboard.serviceRequestSummary.acceptedPendingTreatment,
          tone: "indigo",
          helper: "Solicitudes aceptadas que todavía no iniciaron atención.",
          href: "/admin/patients?signal=accepted_pending_treatment",
          ctaLabel: "Revisar pacientes",
        },
        {
          label: "Faltan datos",
          value: dashboard.operationalSummary.preliminary,
          tone: "amber",
          helper: "Falta completar información mínima para avanzar.",
          href: "/admin/patients?status=preliminary",
          ctaLabel: "Completar datos",
        },
      ],
    },
    {
      title: "En seguimiento",
      description: "Casos en curso que conviene monitorear.",
      emptyMessage: "No hay tratamientos activos para seguir hoy.",
      metrics: [
        {
          label: "Pacientes en tratamiento",
          value: dashboard.operationalSummary.activeTreatment,
          tone: "emerald",
        },
        {
          label: "Preparar inicio",
          value: dashboard.operationalSummary.readyToStart,
          tone: "slate",
          helper: "Pacientes sin tratamiento activo que ya no tienen bloqueos mínimos.",
          href: "/admin/patients?status=ready_to_start",
          ctaLabel: "Ver pacientes",
        },
      ],
    },
    {
      title: "Contexto / histórico",
      description: "Indicadores generales para lectura global.",
      metrics: [
        {
          label: "Pacientes totales",
          value: dashboard.operationalSummary.totalPatients,
          tone: "slate",
        },
        {
          label: "Tratamientos finalizados",
          value: dashboard.operationalSummary.finishedTreatment,
          tone: "slate",
        },
      ],
    },
  ];
}
