import type { ServiceRequest } from "@/domain/service-request/service-request.types";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
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
  state: "none" | "invalid" | "valid" | "already_used";
  message?: string;
}
export interface ServiceRequestHistoryItem {
  serviceRequest: ServiceRequest;
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
}


export interface PatientHubServiceRequestContext {
  hasServiceRequests: boolean;
  hasInReview: boolean;
  pendingAcceptedServiceRequestId?: string;
  latestClosedRequestStatus?: "closed_without_treatment" | "cancelled";
  latestClosedRequestReason?: string;
}
export type ServiceRequestDisplayStatus =
  | "in_review"
  | "accepted_linked_to_treatment"
  | "accepted_pending_treatment"
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
  hasIncomingReferralLink: boolean;
}): ServiceRequestDisplayStatus {
  if (input.hasIncomingReferralLink) {
    return "accepted_linked_to_treatment";
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
      displayStatus: getServiceRequestDisplayStatus({
        status: serviceRequest.status,
        hasIncomingReferralLink: linkedEpisodes.length > 0,
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
  const finishedEpisodes = episodes.filter((episode) => episode.status === "finished");
  return finishedEpisodes
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
  const latestEpisode = activeEpisode ?? (await getMostRecentEpisodeByPatientId(patient.id));

  return mapPatientToDetailReadModel(patient, {
    activeEpisode: activeEpisode ? mapEpisodeOfCareRead(activeEpisode) : null,
    latestEpisode: latestEpisode ? mapEpisodeOfCareRead(latestEpisode) : null,
  });
}

export async function loadTreatmentServiceRequestContext(input: {
  patientId: string;
  serviceRequestId?: string;
}): Promise<TreatmentServiceRequestContext> {
  const normalizedServiceRequestId = input.serviceRequestId?.trim();

  if (!normalizedServiceRequestId) {
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
