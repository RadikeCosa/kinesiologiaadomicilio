import type { ServiceRequest } from "@/domain/service-request/service-request.types";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToDetailReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import {
  getActiveEpisodeByPatientId,
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
