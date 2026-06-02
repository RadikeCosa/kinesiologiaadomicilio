import { loadPatientsList } from "@/app/admin/patients/data";
import { toAdminOperationalError } from "@/app/admin/operational-error";
import { listEpisodesByIncomingReferralIds } from "@/infrastructure/repositories/episode-of-care.repository";
import { listServiceRequestsByPatientIds } from "@/infrastructure/repositories/service-request.repository";
import { isOperationalFhirError } from "@/lib/fhir/errors";

import { buildAdminDashboardReadModel, buildServiceRequestSummary } from "./dashboard-metrics";
import type { AdminDashboardReadModel } from "./dashboard.read-model";

export async function loadAdminDashboard(): Promise<AdminDashboardReadModel> {
  try {
    const patients = await loadPatientsList();

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

    const serviceRequestSummary = buildServiceRequestSummary(serviceRequests, usedServiceRequestIds);

    return buildAdminDashboardReadModel(patients, serviceRequestSummary);
  } catch (error) {
    if (isOperationalFhirError(error)) {
      throw toAdminOperationalError(error);
    }

    throw error;
  }
}
