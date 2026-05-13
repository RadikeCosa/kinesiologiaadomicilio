import { loadPatientsList } from "@/app/admin/patients/data";
import { listEpisodeOfCareByIncomingReferral } from "@/infrastructure/repositories/episode-of-care.repository";
import { listServiceRequestsByPatientIds } from "@/infrastructure/repositories/service-request.repository";

import { buildAdminDashboardReadModel, buildServiceRequestSummary } from "./dashboard-metrics";
import type { AdminDashboardReadModel } from "./dashboard.read-model";

export async function loadAdminDashboard(): Promise<AdminDashboardReadModel> {
  const patients = await loadPatientsList();

  const serviceRequests = await listServiceRequestsByPatientIds(patients.map((patient) => patient.id));
  const acceptedServiceRequests = serviceRequests.filter((serviceRequest) => serviceRequest.status === "accepted");

  const usedServiceRequestIds = new Set<string>();
  await Promise.all(
    acceptedServiceRequests.map(async (serviceRequest) => {
      const linkedEpisodes = await listEpisodeOfCareByIncomingReferral(serviceRequest.id);

      if (linkedEpisodes.length > 0) {
        usedServiceRequestIds.add(serviceRequest.id);
      }
    }),
  );

  const serviceRequestSummary = buildServiceRequestSummary(serviceRequests, usedServiceRequestIds);

  return buildAdminDashboardReadModel(patients, serviceRequestSummary);
}
