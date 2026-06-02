import { toAdminOperationalError } from "@/app/admin/operational-error";
import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToListItemReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import { selectPatientEpisodes } from "@/domain/episode-of-care/episode-of-care.selectors";
import {
  listEpisodesByIncomingReferralIds,
  listEpisodesByPatientIds,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { listPatients } from "@/infrastructure/repositories/patient.repository";
import { listServiceRequestsByPatientIds } from "@/infrastructure/repositories/service-request.repository";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";
import type { PatientOperationalStatus } from "@/domain/patient/patient.types";
import { isOperationalFhirError } from "@/lib/fhir/errors";

const OPERATIONAL_STATUS_PRIORITY: Record<PatientOperationalStatus, number> = {
  active_treatment: 0,
  ready_to_start: 1,
  preliminary: 2,
  finished_treatment: 3,
};

function sortPatientsList(
  patients: PatientListItemReadModel[],
): PatientListItemReadModel[] {
  return [...patients].sort((first, second) => {
    const statusOrder =
      OPERATIONAL_STATUS_PRIORITY[first.operationalStatus] -
      OPERATIONAL_STATUS_PRIORITY[second.operationalStatus];

    if (statusOrder !== 0) {
      return statusOrder;
    }

    return first.fullName.localeCompare(second.fullName, "es", {
      sensitivity: "base",
    });
  });
}

function logMultipleActiveEpisodes(patientId: string, activeEpisodesCount: number): void {
  console.error("multiple active EpisodeOfCare resources detected while loading patients list", {
    patientId,
    activeEpisodesCount,
  });
}

export interface AdminPatientsListItem extends PatientListItemReadModel {
  operationalSignals: {
    hasInReviewRequest: boolean;
    hasAcceptedPendingTreatment: boolean;
  };
}

async function loadPatientsListBase(): Promise<PatientListItemReadModel[]> {
  try {
    const patients = await listPatients();
    const episodes = await listEpisodesByPatientIds(patients.map((patient) => patient.id));

    const episodesByPatientId = new Map<string, typeof episodes>();
    for (const episode of episodes) {
      const patientId = episode.patientId.trim();
      if (!patientId) continue;

      const existing = episodesByPatientId.get(patientId);
      if (existing) {
        existing.push(episode);
        continue;
      }

      episodesByPatientId.set(patientId, [episode]);
    }

    const patientList = patients.map((patient) => {
      const patientEpisodes = episodesByPatientId.get(patient.id) ?? [];
      const {
        activeEpisode,
        activeEpisodesCount,
        effectiveEpisode,
        hasMultipleActiveEpisodes,
      } = selectPatientEpisodes(patientEpisodes);

      if (hasMultipleActiveEpisodes) {
        logMultipleActiveEpisodes(patient.id, activeEpisodesCount);
      }

      return mapPatientToListItemReadModel(patient, {
        activeEpisode: activeEpisode ? mapEpisodeOfCareRead(activeEpisode) : null,
        latestEpisode: effectiveEpisode ? mapEpisodeOfCareRead(effectiveEpisode) : null,
      });
    });

    return sortPatientsList(patientList);
  } catch (error) {
    if (isOperationalFhirError(error)) {
      throw toAdminOperationalError(error);
    }

    throw error;
  }
}

export async function loadPatientsList(): Promise<PatientListItemReadModel[]> {
  return loadPatientsListBase();
}

export async function loadPatientsListWithOperationalSignals(): Promise<AdminPatientsListItem[]> {
  try {
    const patients = await loadPatientsListBase();
    const serviceRequests = await listServiceRequestsByPatientIds(patients.map((patient) => patient.id));
    const acceptedServiceRequests = serviceRequests.filter((serviceRequest) => serviceRequest.status === "accepted");
    const acceptedServiceRequestIds = acceptedServiceRequests.map((serviceRequest) => serviceRequest.id);
    const linkedEpisodes = await listEpisodesByIncomingReferralIds(acceptedServiceRequestIds);
    const acceptedServiceRequestIdSet = new Set(acceptedServiceRequestIds);
    const usedServiceRequestIds = new Set(
      linkedEpisodes
        .map((episode) => episode.serviceRequestId?.trim())
        .filter((serviceRequestId): serviceRequestId is string => Boolean(serviceRequestId))
        .filter((serviceRequestId) => acceptedServiceRequestIdSet.has(serviceRequestId)),
    );

    const serviceRequestsByPatientId = new Map<string, typeof serviceRequests>();
    for (const serviceRequest of serviceRequests) {
      const patientId = serviceRequest.patientId.trim();
      if (!patientId) continue;

      const existing = serviceRequestsByPatientId.get(patientId);
      if (existing) {
        existing.push(serviceRequest);
        continue;
      }

      serviceRequestsByPatientId.set(patientId, [serviceRequest]);
    }

    return patients.map((patient) => {
      const patientServiceRequests = serviceRequestsByPatientId.get(patient.id) ?? [];

      return {
        ...patient,
        operationalSignals: {
          hasInReviewRequest: patientServiceRequests.some((serviceRequest) => serviceRequest.status === "in_review"),
          hasAcceptedPendingTreatment: patientServiceRequests.some((serviceRequest) => (
            serviceRequest.status === "accepted" && !usedServiceRequestIds.has(serviceRequest.id)
          )),
        },
      };
    });
  } catch (error) {
    if (isOperationalFhirError(error)) {
      throw toAdminOperationalError(error);
    }

    throw error;
  }
}
