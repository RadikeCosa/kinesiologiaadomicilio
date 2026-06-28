import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import type {
  PatientClinicalRecentSummary,
  PatientHubServiceRequestContext,
} from "@/app/admin/patients/[id]/data";
import { getMissingTreatmentStartRequirements } from "@/domain/patient/patient.rules";
import { formatDateDisplay } from "@/lib/patient-admin-display";

export interface PatientHubPrimaryAction {
  href: string;
  label: "Gestión administrativa" | "Tratamiento" | "Registrar visita";
  supportingCopy: string;
}

export interface PatientHubViewModel {
  headerStatusDetail: string | null;
  missingRequirementLabels: string[];
  briefClinicalSignal: string;
  primaryAction: PatientHubPrimaryAction;
}

function mapMissingRequirementLabel(reason: ReturnType<typeof getMissingTreatmentStartRequirements>[number]): string {
  switch (reason) {
    case "missing_patient_address":
      return "Falta domicilio";
    case "missing_contact_phone":
      return "Falta teléfono";
    default:
      return "Falta identidad";
  }
}

function getHeaderStatusDetail(patient: PatientDetailReadModel): string | null {
  if (patient.activeEpisode?.startDate) {
    return `Inicio: ${formatDateDisplay(patient.activeEpisode.startDate)}`;
  }

  if (patient.latestEpisode?.status === "finished" && patient.latestEpisode.endDate) {
    return `Fin: ${formatDateDisplay(patient.latestEpisode.endDate)}`;
  }

  return null;
}

function getBriefClinicalSignal(summary: PatientClinicalRecentSummary): string {
  const firstMetric = summary.metrics[0];

  if (firstMetric) {
    return `${firstMetric.label}: ${firstMetric.value}`;
  }

  if (summary.kinesiologicDiagnosisText) {
    return "Impresión kinésica registrada";
  }

  if (summary.medicalReferenceDiagnosisText) {
    return "Diagnóstico de referencia registrado";
  }

  if (summary.treatmentStatusLabel === "Sin tratamiento activo") {
    return "Sin señal clínica reciente";
  }

  return "Marco clínico incompleto";
}

function getPrimaryAction(input: {
  patient: PatientDetailReadModel;
  serviceRequestContext: PatientHubServiceRequestContext;
}): PatientHubPrimaryAction {
  const { patient, serviceRequestContext } = input;
  const hasAcceptedPending = Boolean(serviceRequestContext.pendingAcceptedServiceRequestId);

  if (patient.activeEpisode) {
    return {
      href: `/admin/patients/${patient.id}/encounters/new`,
      label: "Registrar visita",
      supportingCopy: "El tratamiento está activo. Registrá la próxima visita desde Gestión clínica.",
    };
  }

  if (
    (patient.operationalStatus === "ready_to_start" || patient.operationalStatus === "finished_treatment")
    && hasAcceptedPending
  ) {
    return {
      href: `/admin/patients/${patient.id}/treatment`,
      label: "Tratamiento",
      supportingCopy: "Ya hay una solicitud aceptada disponible para iniciar un nuevo tratamiento.",
    };
  }

  if (patient.operationalStatus === "preliminary") {
    return {
      href: `/admin/patients/${patient.id}/administrative`,
      label: "Gestión administrativa",
      supportingCopy: "Completá los datos operativos y registrá la solicitud de atención para destrabar el inicio.",
    };
  }

  if (patient.operationalStatus === "finished_treatment") {
    return {
      href: `/admin/patients/${patient.id}/administrative`,
      label: "Gestión administrativa",
      supportingCopy: "Si corresponde un nuevo ciclo, registrá o resolvé una nueva solicitud de atención.",
    };
  }

  return {
    href: `/admin/patients/${patient.id}/administrative`,
    label: "Gestión administrativa",
    supportingCopy: "Todavía no hay una solicitud aceptada lista para iniciar tratamiento.",
  };
}

export function buildPatientHubViewModel(input: {
  patient: PatientDetailReadModel;
  clinicalRecentSummary: PatientClinicalRecentSummary;
  serviceRequestContext: PatientHubServiceRequestContext;
}): PatientHubViewModel {
  const { patient, clinicalRecentSummary, serviceRequestContext } = input;
  const showMissingRequirements = patient.operationalStatus === "preliminary" && !patient.activeEpisode;

  return {
    headerStatusDetail: getHeaderStatusDetail(patient),
    missingRequirementLabels: showMissingRequirements
      ? getMissingTreatmentStartRequirements(patient).map(mapMissingRequirementLabel)
      : [],
    briefClinicalSignal: getBriefClinicalSignal(clinicalRecentSummary),
    primaryAction: getPrimaryAction({
      patient,
      serviceRequestContext,
    }),
  };
}
