import { loadPatientsList } from "@/app/admin/patients/data";

import { buildAdminDashboardReadModel } from "./dashboard-metrics";
import type { AdminDashboardReadModel } from "./dashboard.read-model";

export async function loadAdminDashboard(): Promise<AdminDashboardReadModel> {
  const patients = await loadPatientsList();

  return buildAdminDashboardReadModel(patients);
}
