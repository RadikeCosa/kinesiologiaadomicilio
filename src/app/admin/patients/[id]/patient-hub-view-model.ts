import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import type {
  PatientClinicalRecentSummary,
  PatientHubServiceRequestContext,
} from "@/app/admin/patients/[id]/data";
import { getMissingTreatmentStartRequirements } from "@/domain/patient/patient.rules";
import { formatDateDisplay } from "@/lib/patient-admin-display";
import { PATIENT_SURFACE_COPY } from "@/app/admin/patients/[id]/patient-surface-copy";

export interface PatientHubPrimaryAction {
  href: string;
  label: "Gestión administrativa" | "Iniciar tratamiento" | "Registrar visita" | "Registrar solicitud" | "Revisar solicitud";
  supportingCopy: string;
}

export interface PatientHubSecondaryAction {
  href: string;
  label: "Completar datos administrativos";
}

export interface PatientHubViewModel {
  title: string;
  headerStatusDetail: string | null;
  missingRequirementLabels: string[];
  briefClinicalSignal: string;
  primaryAction: PatientHubPrimaryAction;
  secondaryAction?: PatientHubSecondaryAction;
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
  requestCreated: boolean;
}): PatientHubPrimaryAction {
  const { patient, serviceRequestContext, requestCreated } = input;
  const hasAcceptedPending = Boolean(serviceRequestContext.pendingAcceptedServiceRequestId);
  const needsInitialServiceRequest = !patient.activeEpisode && !serviceRequestContext.hasInReview && !hasAcceptedPending && !serviceRequestContext.hasServiceRequests;

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
      href: `/admin/patients/${patient.id}/treatment?serviceRequestId=${serviceRequestContext.pendingAcceptedServiceRequestId}`,
      label: "Iniciar tratamiento",
      supportingCopy: PATIENT_SURFACE_COPY.acceptedRequestDescription,
    };
  }

  if (serviceRequestContext.hasInReview) {
    return {
      href: `/admin/patients/${patient.id}/administrative#service-requests`,
      label: "Revisar solicitud",
      supportingCopy: requestCreated
        ? PATIENT_SURFACE_COPY.requestCreatedDescription
        : PATIENT_SURFACE_COPY.reviewRequestDescription,
    };
  }

  if (needsInitialServiceRequest) {
    return {
      href: `/admin/patients/${patient.id}/administrative?newServiceRequest=1#service-requests`,
      label: "Registrar solicitud",
      supportingCopy: PATIENT_SURFACE_COPY.nextRequestStepDescription,
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
    supportingCopy: "El paciente puede estar administrativamente listo, pero todavía no hay una solicitud aceptada lista para iniciar tratamiento.",
  };
}

function getPrimaryCardTitle(input: {
  patient: PatientDetailReadModel;
  serviceRequestContext: PatientHubServiceRequestContext;
  requestCreated: boolean;
}): string {
  const { patient, serviceRequestContext, requestCreated } = input;

  if (patient.activeEpisode) {
    return PATIENT_SURFACE_COPY.activeTreatmentTitle;
  }

  if (serviceRequestContext.pendingAcceptedServiceRequestId) {
    return PATIENT_SURFACE_COPY.acceptedRequestTitle;
  }

  if (serviceRequestContext.hasInReview) {
    return requestCreated
      ? PATIENT_SURFACE_COPY.requestCreatedTitle
      : PATIENT_SURFACE_COPY.reviewRequestTitle;
  }

  return PATIENT_SURFACE_COPY.nextRequestStepTitle;
}

export function buildPatientHubViewModel(input: {
  patient: PatientDetailReadModel;
  clinicalRecentSummary: PatientClinicalRecentSummary;
  serviceRequestContext: PatientHubServiceRequestContext;
  requestCreated?: boolean;
}): PatientHubViewModel {
  const { patient, clinicalRecentSummary, serviceRequestContext } = input;
  const requestCreated = Boolean(input.requestCreated && serviceRequestContext.hasInReview && !patient.activeEpisode);
  const showMissingRequirements = patient.operationalStatus === "preliminary" && !patient.activeEpisode;

  return {
    title: getPrimaryCardTitle({
      patient,
      serviceRequestContext,
      requestCreated,
    }),
    headerStatusDetail: getHeaderStatusDetail(patient),
    missingRequirementLabels: showMissingRequirements
      ? getMissingTreatmentStartRequirements(patient).map(mapMissingRequirementLabel)
      : [],
    briefClinicalSignal: getBriefClinicalSignal(clinicalRecentSummary),
    primaryAction: getPrimaryAction({
      patient,
      serviceRequestContext,
      requestCreated,
    }),
    secondaryAction: requestCreated
      ? {
          href: `/admin/patients/${patient.id}/administrative`,
          label: "Completar datos administrativos",
        }
      : undefined,
  };
}
