import { describe, expect, it, vi } from "vitest";

import { loadAdminDashboard } from "@/app/admin/data";

vi.mock("@/app/admin/patients/data", () => ({
  loadPatientsList: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  listServiceRequestsByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  listEpisodeOfCareByIncomingReferral: vi.fn(),
}));

import { loadPatientsList } from "@/app/admin/patients/data";
import { listEpisodeOfCareByIncomingReferral } from "@/infrastructure/repositories/episode-of-care.repository";
import { listServiceRequestsByPatientId } from "@/infrastructure/repositories/service-request.repository";

describe("loadAdminDashboard", () => {
  it("builds dashboard read model from patients list and service request funnel", async () => {
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

    vi.mocked(listServiceRequestsByPatientId)
      .mockResolvedValueOnce([
        { id: "sr-1", patientId: "pat-1", status: "in_review", requestedAt: "2026-04-01", reasonText: "A" },
        { id: "sr-2", patientId: "pat-1", status: "accepted", requestedAt: "2026-04-02", reasonText: "B" },
      ] as never)
      .mockResolvedValueOnce([
        { id: "sr-3", patientId: "pat-2", status: "accepted", requestedAt: "2026-04-03", reasonText: "C" },
        { id: "sr-4", patientId: "pat-2", status: "closed_without_treatment", requestedAt: "2026-04-04", reasonText: "D" },
        { id: "sr-5", patientId: "pat-2", status: "cancelled", requestedAt: "2026-04-05", reasonText: "E" },
      ] as never);

    vi.mocked(listEpisodeOfCareByIncomingReferral)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "epi-1" }] as never);

    const dashboard = await loadAdminDashboard();

    expect(loadPatientsList).toHaveBeenCalledTimes(1);
    expect(listServiceRequestsByPatientId).toHaveBeenCalledTimes(2);
    expect(listEpisodeOfCareByIncomingReferral).toHaveBeenCalledTimes(2);
    expect(dashboard.operationalSummary.withoutStartedTreatment).toBe(1);
    expect(dashboard.ageSummary.withValidBirthDate).toBe(1);
    expect(dashboard.ageSummary.withoutValidBirthDate).toBe(0);
    expect(dashboard.serviceRequestSummary).toEqual({
      inReview: 1,
      acceptedPendingTreatment: 1,
    });
  });
});
