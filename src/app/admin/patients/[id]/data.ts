import type { ServiceRequest } from "@/domain/service-request/service-request.types";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { selectPatientEpisodes } from "@/domain/episode-of-care/episode-of-care.selectors";
import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToDetailReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import {
  getActiveEpisodeByPatientId,
  listEpisodeOfCareByPatientId,
  getMostRecentEpisodeByPatientId,
  listEpisodeOfCareByIncomingReferral,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import {
  getServiceRequestById,
  listServiceRequestsByPatientId,
} from "@/infrastructure/repositories/service-request.repository";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import { listFunctionalObservationsByEncounterId } from "@/infrastructure/repositories/observation.repository";
import { loadEpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

export interface PatientServiceRequestReadContext {
  serviceRequests: ServiceRequest[];
  latestServiceRequest: ServiceRequest | null;
}

export interface PatientAdministrativeReadContext extends PatientServiceRequestReadContext {
  patient: PatientDetailReadModel | null;
}

export interface TreatmentServiceRequestContext {
  serviceRequestId?: string;
  isValid: boolean;
  serviceRequest?: ServiceRequest;
  state: "none" | "invalid" | "valid" | "already_used" | "multiple_pending";
  message?: string;
}
export interface ServiceRequestHistoryItem {
  serviceRequest: ServiceRequest;
  linkedEpisode?: {
    id: string;
    status: string;
    startDate?: string;
    endDate?: string;
    closureReason?: string;
    closureReasonLabel?: string;
    closureDetail?: string;
  };
  linkedEpisodeOfCareId?: string;
  linkedEpisodeOfCareStartDate?: string;
  linkedEpisodeOfCareEndDate?: string;
  displayStatus: ServiceRequestDisplayStatus;
  startedTreatment: boolean;
  isPendingOperational: boolean;
}
export interface PatientServiceRequestHistoryContext {
  activeServiceRequest: ServiceRequestHistoryItem | null;
  historicalServiceRequests: ServiceRequestHistoryItem[];
}

export interface TreatmentEpisodeHistoryItem {
  id: string;
  startDate: string;
  endDate?: string;
  closureReason?: string;
  closureDetail?: string;
  serviceRequestId?: string;
  medicalReferenceDiagnosisText?: string;
  kinesiologicDiagnosisText?: string;
  therapeuticGoals?: string;
  frameworkPlan?: string;
}


export interface PatientHubServiceRequestContext {
  hasServiceRequests: boolean;
  hasInReview: boolean;
  pendingAcceptedServiceRequestId?: string;
  latestClosedRequestStatus?: "closed_without_treatment" | "cancelled";
  latestClosedRequestReason?: string;
}

const RECENT_FUNCTIONAL_PRIORITY = [
  "pain_nrs_0_10",
  "gait_duration_minutes",
  "tug_seconds",
  "standing_tolerance_minutes",
] as const;

type RecentFunctionalCode = typeof RECENT_FUNCTIONAL_PRIORITY[number];

const RECENT_FUNCTIONAL_META: Record<RecentFunctionalCode, { label: string; unit: "/10" | "min" | "s" }> = {
  pain_nrs_0_10: { label: "Dolor", unit: "/10" },
  gait_duration_minutes: { label: "Marcha", unit: "min" },
  tug_seconds: { label: "TUG", unit: "s" },
  standing_tolerance_minutes: { label: "Bipedestación", unit: "min" },
};

export interface ClinicalRecentSummaryItem {
  label: string;
  value: string;
}

export interface PatientClinicalRecentSummary {
  treatmentStatusLabel: "Tratamiento activo" | "Nuevo tratamiento activo" | "Tratamiento finalizado" | "Sin tratamiento activo";
  latestEncounterLabel: string;
  encountersCount: number;
  metrics: ClinicalRecentSummaryItem[];
  metricsEmptyLabel: string;
  medicalReferenceDiagnosisText?: string;
  kinesiologicDiagnosisText?: string;
  ctaLabel: "Ver gestión clínica" | "Registrar primera visita";
}

export async function loadActiveTreatmentEncountersCount(patientId: string, activeEpisodeId?: string): Promise<number> {
  if (!patientId.trim() || !activeEpisodeId?.trim()) {
    return 0;
  }

  const encounters = await listEncountersByPatientId(patientId);

  return encounters.filter((encounter) => encounter.episodeOfCareId === activeEpisodeId).length;
}

function formatMetricValue(value: number, unit: "/10" | "min" | "s"): string {
  if (unit === "/10") {
    return `${value}/10`;
  }

  return `${value} ${unit}`;
}

export async function loadPatientClinicalRecentSummary(patientId: string): Promise<PatientClinicalRecentSummary> {
  const [activeEpisode, mostRecentEpisode, encounters] = await Promise.all([
    getActiveEpisodeByPatientId(patientId),
    getMostRecentEpisodeByPatientId(patientId),
    listEncountersByPatientId(patientId),
  ]);

  const { effectiveEpisode } = selectPatientEpisodes(
    [activeEpisode, mostRecentEpisode].filter((episode): episode is EpisodeOfCare => Boolean(episode)),
  );
  const scopedEncounters = effectiveEpisode
    ? encounters
      .filter((encounter) => encounter.episodeOfCareId === effectiveEpisode.id)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    : [];

  const latestEncounter = scopedEncounters[0];
  const treatmentStatusLabel: PatientClinicalRecentSummary["treatmentStatusLabel"] = activeEpisode
    ? (scopedEncounters.length === 0 ? "Nuevo tratamiento activo" : "Tratamiento activo")
    : mostRecentEpisode?.status === "finished"
      ? "Tratamiento finalizado"
      : "Sin tratamiento activo";

  const latestEncounterLabel = latestEncounter
    ? latestEncounter.startedAt
    : activeEpisode
      ? "Aún no registrada"
      : "No disponible";

  const metricsByCode = new Map<RecentFunctionalCode, { value: number; date: string }>();
  await Promise.all(scopedEncounters.map(async (encounter) => {
    const observations = await listFunctionalObservationsByEncounterId(encounter.id);
    observations.forEach((observation) => {
      if (!RECENT_FUNCTIONAL_PRIORITY.includes(observation.code as RecentFunctionalCode)) {
        return;
      }
      const code = observation.code as RecentFunctionalCode;
      const existing = metricsByCode.get(code);
      const obsDate = new Date(observation.effectiveDateTime).getTime();
      const existingDate = existing ? new Date(existing.date).getTime() : Number.NEGATIVE_INFINITY;
      if (!existing || obsDate >= existingDate) {
        metricsByCode.set(code, { value: observation.value, date: observation.effectiveDateTime });
      }
    });
  }));

  const clinicalContext = effectiveEpisode ? await loadEpisodeClinicalContextReadModel(effectiveEpisode) : null;

  const metrics = RECENT_FUNCTIONAL_PRIORITY
    .flatMap((code) => {
      const metric = metricsByCode.get(code);
      if (!metric) {
        return [];
      }

      return [{
        label: RECENT_FUNCTIONAL_META[code].label,
        value: formatMetricValue(metric.value, RECENT_FUNCTIONAL_META[code].unit),
      }];
    })
    .slice(0, 2);

  return {
    treatmentStatusLabel,
    latestEncounterLabel,
    encountersCount: scopedEncounters.length,
    metrics,
    metricsEmptyLabel: activeEpisode ? "Sin registros funcionales todavía" : "Sin registros funcionales",
    medicalReferenceDiagnosisText: clinicalContext?.medicalReferenceDiagnosisText,
    kinesiologicDiagnosisText: clinicalContext?.kinesiologicDiagnosisText,
    ctaLabel: activeEpisode && scopedEncounters.length === 0 ? "Registrar primera visita" : "Ver gestión clínica",
  };
}
export type ServiceRequestDisplayStatus =
  | "in_review"
  | "accepted_pending_treatment"
  | "accepted_linked_active_treatment"
  | "accepted_linked_finished_treatment"
  | "closed_without_treatment"
  | "cancelled"
  | "entered_in_error";

export function isOperationalPendingServiceRequest(input: {
  status: ServiceRequest["status"];
  hasIncomingReferralLink: boolean;
}): boolean {
  if (input.hasIncomingReferralLink) {
    return false;
  }

  if (input.status === "in_review") {
    return true;
  }

  if (input.status === "accepted") {
    return !input.hasIncomingReferralLink;
  }

  return false;
}

export function getServiceRequestDisplayStatus(input: {
  status: ServiceRequest["status"];
  linkedEpisodeStatus?: string;
}): ServiceRequestDisplayStatus {
  if (input.status === "accepted" && input.linkedEpisodeStatus === "finished") {
    return "accepted_linked_finished_treatment";
  }

  if (input.status === "accepted" && input.linkedEpisodeStatus) {
    return "accepted_linked_active_treatment";
  }

  if (input.status === "accepted") {
    return "accepted_pending_treatment";
  }

  return input.status;
}

export function selectActiveServiceRequestToResolve(items: ServiceRequestHistoryItem[]): ServiceRequestHistoryItem | null {
  const inReview = items.find((item) => item.displayStatus === "in_review");
  if (inReview) {
    return inReview;
  }

  const acceptedPending = items.find((item) => item.displayStatus === "accepted_pending_treatment");
  return acceptedPending ?? null;
}

export async function loadPatientHubServiceRequestContext(patientId: string): Promise<PatientHubServiceRequestContext> {
  const { serviceRequests } = await loadPatientServiceRequestContext(patientId);

  if (serviceRequests.length === 0) {
    return {
      hasServiceRequests: false,
      hasInReview: false,
      pendingAcceptedServiceRequestId: undefined,
      latestClosedRequestStatus: undefined,
      latestClosedRequestReason: undefined,
    };
  }

  const hasInReview = serviceRequests.some((serviceRequest) => serviceRequest.status === "in_review");
  const latestClosedRequest = serviceRequests.find((serviceRequest) =>
    serviceRequest.status === "closed_without_treatment" || serviceRequest.status === "cancelled",
  );
  const acceptedServiceRequests = serviceRequests.filter((serviceRequest) => serviceRequest.status === "accepted");

  for (const serviceRequest of acceptedServiceRequests) {
    const linkedEpisodes = await listEpisodeOfCareByIncomingReferral(serviceRequest.id);

    if (isOperationalPendingServiceRequest({
      status: serviceRequest.status,
      hasIncomingReferralLink: linkedEpisodes.length > 0,
    })) {
      return {
        hasServiceRequests: true,
        hasInReview,
        pendingAcceptedServiceRequestId: serviceRequest.id,
        latestClosedRequestStatus: latestClosedRequest?.status === "closed_without_treatment" || latestClosedRequest?.status === "cancelled"
          ? latestClosedRequest.status
          : undefined,
        latestClosedRequestReason: latestClosedRequest?.closedReasonText,
      };
    }
  }

  return {
    hasServiceRequests: true,
    hasInReview,
    pendingAcceptedServiceRequestId: undefined,
    latestClosedRequestStatus: latestClosedRequest?.status === "closed_without_treatment" || latestClosedRequest?.status === "cancelled"
      ? latestClosedRequest.status
      : undefined,
    latestClosedRequestReason: latestClosedRequest?.closedReasonText,
  };
}

async function loadAcceptedPendingServiceRequests(patientId: string): Promise<ServiceRequest[]> {
  const { serviceRequests } = await loadPatientServiceRequestContext(patientId);
  const acceptedServiceRequests = serviceRequests.filter((serviceRequest) => serviceRequest.status === "accepted");

  const pendingChecks = await Promise.all(
    acceptedServiceRequests.map(async (serviceRequest) => {
      const linkedEpisodes = await listEpisodeOfCareByIncomingReferral(serviceRequest.id);

      return isOperationalPendingServiceRequest({
        status: serviceRequest.status,
        hasIncomingReferralLink: linkedEpisodes.length > 0,
      })
        ? serviceRequest
        : null;
    }),
  );

  return pendingChecks.filter((serviceRequest): serviceRequest is ServiceRequest => Boolean(serviceRequest));
}

export function sortServiceRequestsByRequestedAtDesc(serviceRequests: ServiceRequest[]): ServiceRequest[] {
  return [...serviceRequests].sort((a, b) => {
    if (a.requestedAt !== b.requestedAt) {
      return b.requestedAt.localeCompare(a.requestedAt);
    }

    return b.id.localeCompare(a.id);
  });
}

export async function loadPatientServiceRequestContext(patientId: string): Promise<PatientServiceRequestReadContext> {
  if (!patientId.trim()) {
    return {
      serviceRequests: [],
      latestServiceRequest: null,
    };
  }

  const serviceRequests = await listServiceRequestsByPatientId(patientId);
  const orderedServiceRequests = sortServiceRequestsByRequestedAtDesc(serviceRequests);

  return {
    serviceRequests: orderedServiceRequests,
    latestServiceRequest: orderedServiceRequests[0] ?? null,
  };
}

export async function loadPatientServiceRequestHistoryContext(patientId: string): Promise<PatientServiceRequestHistoryContext> {
  const { serviceRequests } = await loadPatientServiceRequestContext(patientId);
  const enriched = await Promise.all(serviceRequests.map(async (serviceRequest) => {
    const linkedEpisodes = serviceRequest.status === "accepted" || serviceRequest.status === "in_review"
      ? await listEpisodeOfCareByIncomingReferral(serviceRequest.id)
      : [];
    const linkedEpisode = linkedEpisodes[0];

    return {
      serviceRequest,
      linkedEpisodeOfCareId: linkedEpisode?.id,
      linkedEpisodeOfCareStartDate: linkedEpisode?.startDate,
      linkedEpisodeOfCareEndDate: linkedEpisode?.endDate,
      linkedEpisode: linkedEpisode
        ? {
            id: linkedEpisode.id,
            status: linkedEpisode.status,
            startDate: linkedEpisode.startDate,
            endDate: linkedEpisode.endDate,
            closureReason: linkedEpisode.closureReason,
            closureReasonLabel: linkedEpisode.closureReason,
            closureDetail: linkedEpisode.closureDetail,
          }
        : undefined,
      displayStatus: getServiceRequestDisplayStatus({
        status: serviceRequest.status,
        linkedEpisodeStatus: linkedEpisode?.status,
      }),
      startedTreatment: linkedEpisodes.length > 0,
      isPendingOperational: isOperationalPendingServiceRequest({
        status: serviceRequest.status,
        hasIncomingReferralLink: linkedEpisodes.length > 0,
      }),
    } satisfies ServiceRequestHistoryItem;
  }));

  const activeServiceRequest = selectActiveServiceRequestToResolve(enriched);
  const historicalServiceRequests = enriched.filter((item) => item.serviceRequest.id !== activeServiceRequest?.serviceRequest.id);

  return { activeServiceRequest, historicalServiceRequests };
}

export async function loadTreatmentEpisodeHistoryContext(patientId: string): Promise<TreatmentEpisodeHistoryItem[]> {
  const episodes = await listEpisodeOfCareByPatientId(patientId);
  const { closedEpisodes } = selectPatientEpisodes(episodes);
  return closedEpisodes
    .sort((a, b) => (b.endDate ?? b.startDate).localeCompare(a.endDate ?? a.startDate))
    .map((episode) => ({
      id: episode.id,
      startDate: episode.startDate,
      endDate: episode.endDate,
      closureReason: episode.closureReason,
      closureDetail: episode.closureDetail,
      serviceRequestId: episode.serviceRequestId,
    }));
}

export async function loadPatientAdministrativeContext(patientId: string): Promise<PatientAdministrativeReadContext> {
  const patient = await loadPatientDetail(patientId);

  if (!patient) {
    return {
      patient: null,
      serviceRequests: [],
      latestServiceRequest: null,
    };
  }

  const serviceRequestContext = await loadPatientServiceRequestContext(patient.id);

  return {
    patient,
    ...serviceRequestContext,
  };
}

export async function loadPatientDetail(id: string): Promise<PatientDetailReadModel | null> {
  const patient = await getPatientById(id);

  if (!patient) {
    return null;
  }

  const activeEpisode = await getActiveEpisodeByPatientId(patient.id);
  const mostRecentEpisode = activeEpisode ? null : await getMostRecentEpisodeByPatientId(patient.id);
  const { effectiveEpisode } = selectPatientEpisodes(
    [activeEpisode, mostRecentEpisode].filter((episode): episode is EpisodeOfCare => Boolean(episode)),
  );

  return mapPatientToDetailReadModel(patient, {
    activeEpisode: activeEpisode ? mapEpisodeOfCareRead(activeEpisode) : null,
    latestEpisode: effectiveEpisode ? mapEpisodeOfCareRead(effectiveEpisode) : null,
  });
}

export async function loadTreatmentServiceRequestContext(input: {
  patientId: string;
  serviceRequestId?: string;
}): Promise<TreatmentServiceRequestContext> {
  const normalizedServiceRequestId = input.serviceRequestId?.trim();

  if (!normalizedServiceRequestId) {
    const acceptedPendingServiceRequests = await loadAcceptedPendingServiceRequests(input.patientId);

    if (acceptedPendingServiceRequests.length === 1) {
      const [serviceRequest] = acceptedPendingServiceRequests;

      return {
        serviceRequestId: serviceRequest.id,
        isValid: true,
        serviceRequest,
        state: "valid",
        message: undefined,
      };
    }

    if (acceptedPendingServiceRequests.length > 1) {
      return {
        serviceRequestId: undefined,
        isValid: false,
        serviceRequest: undefined,
        state: "multiple_pending",
        message: "Hay más de una solicitud aceptada pendiente. Elegí cuál usar desde Gestión administrativa antes de iniciar tratamiento.",
      };
    }

    return {
      serviceRequestId: undefined,
      isValid: false,
      serviceRequest: undefined,
      state: "none",
      message: undefined,
    };
  }

  const serviceRequest = await getServiceRequestById(normalizedServiceRequestId);
  const isValid = Boolean(
    serviceRequest
      && serviceRequest.patientId === input.patientId
      && serviceRequest.status === "accepted",
  );

  if (!isValid) {
    return {
      serviceRequestId: undefined,
      isValid: false,
      serviceRequest: undefined,
      state: "invalid",
      message: undefined,
    };
  }

  const linkedEpisodes = await listEpisodeOfCareByIncomingReferral(normalizedServiceRequestId);

  if (linkedEpisodes.length > 0) {
    return {
      serviceRequestId: undefined,
      isValid: false,
      serviceRequest: undefined,
      state: "already_used",
      message: "Esta solicitud ya fue utilizada para iniciar un tratamiento. Para un nuevo ciclo, registrá una nueva solicitud.",
    };
  }

  return {
    serviceRequestId: normalizedServiceRequestId,
    isValid: true,
    serviceRequest: serviceRequest ?? undefined,
    state: "valid",
    message: undefined,
  };
}
