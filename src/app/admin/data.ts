import { loadPatientsList } from "@/app/admin/patients/data";
import { listEpisodesByIncomingReferralIds } from "@/infrastructure/repositories/episode-of-care.repository";
import { listServiceRequestsByPatientIds } from "@/infrastructure/repositories/service-request.repository";

import { buildAdminDashboardReadModel, buildServiceRequestSummary } from "./dashboard-metrics";
import type { AdminDashboardReadModel } from "./dashboard.read-model";

export async function loadAdminDashboard(): Promise<AdminDashboardReadModel> {
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
}
