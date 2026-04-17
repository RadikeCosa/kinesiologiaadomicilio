import { describe, expect, it, vi } from "vitest";

import { loadPatientsList } from "@/app/admin/patients/data";

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  listPatients: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: vi.fn(),
  getMostRecentEpisodeByPatientId: vi.fn(),
}));

import { listPatients } from "@/infrastructure/repositories/patient.repository";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";

describe("loadPatientsList", () => {
  it("maps finished_treatment when no active episode exists but latest is finished", async () => {
    vi.mocked(listPatients).mockResolvedValue([
      {
        id: "pat-1",
        firstName: "Ana",
        lastName: "Pérez",
        dni: "32123456",
        createdAt: "2026-04-17T12:00:00.000Z",
        updatedAt: "2026-04-17T12:00:00.000Z",
      },
    ]);

    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-03-01",
      endDate: "2026-04-01",
    });

    const patients = await loadPatientsList();

    expect(getMostRecentEpisodeByPatientId).toHaveBeenCalledWith("pat-1");
    expect(patients[0]?.operationalStatus).toBe("finished_treatment");
  });
});
