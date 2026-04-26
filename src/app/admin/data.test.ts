import { describe, expect, it, vi } from "vitest";

import { loadAdminDashboard } from "@/app/admin/data";

vi.mock("@/app/admin/patients/data", () => ({
  loadPatientsList: vi.fn(),
}));

import { loadPatientsList } from "@/app/admin/patients/data";

describe("loadAdminDashboard", () => {
  it("builds dashboard read model from patients list without querying encounters", async () => {
    vi.mocked(loadPatientsList).mockResolvedValueOnce([
      {
        id: "pat-1",
        fullName: "Ana Pérez",
        operationalStatus: "active_treatment",
        birthDate: "1990-01-10",
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
      {
        id: "pat-2",
        fullName: "Bruno Díaz",
        operationalStatus: "ready_to_start",
        birthDate: "invalid-date",
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
    ]);

    const dashboard = await loadAdminDashboard();

    expect(loadPatientsList).toHaveBeenCalledTimes(1);
    expect(dashboard.operationalSummary.totalPatients).toBe(2);
    expect(dashboard.operationalSummary.withoutStartedTreatment).toBe(1);
    expect(dashboard.ageSummary.withValidBirthDate).toBe(1);
    expect(dashboard.ageSummary.withoutValidBirthDate).toBe(1);
    expect(dashboard.ageSummary.note).toBe(
      "La edad se calcula únicamente sobre pacientes con fecha de nacimiento válida.",
    );
  });
});
