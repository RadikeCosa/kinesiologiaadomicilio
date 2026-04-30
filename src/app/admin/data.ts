import { loadPatientsList } from "@/app/admin/patients/data";
import { listEpisodeOfCareByIncomingReferral } from "@/infrastructure/repositories/episode-of-care.repository";
import { listServiceRequestsByPatientId } from "@/infrastructure/repositories/service-request.repository";

import { buildAdminDashboardReadModel, buildServiceRequestSummary } from "./dashboard-metrics";
import type { AdminDashboardReadModel } from "./dashboard.read-model";

export async function loadAdminDashboard(): Promise<AdminDashboardReadModel> {
  const patients = await loadPatientsList();

  // TECH-DEBT: dashboard SR metrics use per-patient composition; replace with aggregate/read-model if volume grows.
  const serviceRequestsByPatient = await Promise.all(
    patients.map(async (patient) => listServiceRequestsByPatientId(patient.id)),
  );

  const serviceRequests = serviceRequestsByPatient.flat();
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
