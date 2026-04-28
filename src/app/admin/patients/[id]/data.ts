import type { ServiceRequest } from "@/domain/service-request/service-request.types";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToDetailReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import { listServiceRequestsByPatientId } from "@/infrastructure/repositories/service-request.repository";

export interface PatientServiceRequestReadContext {
  serviceRequests: ServiceRequest[];
  latestServiceRequest: ServiceRequest | null;
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
