import { describe, expect, it, vi } from "vitest";

import { finishEpisodeOfCareAction } from "@/app/admin/patients/[id]/actions/finish-episode-of-care.action";

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: vi.fn(),
  finishActiveEpisodeOfCare: vi.fn(),
}));

import {
  finishActiveEpisodeOfCare,
  getActiveEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";

describe("finishEpisodeOfCareAction", () => {
  it("fails when there is no active episode", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);

    const result = await finishEpisodeOfCareAction({
      patientId: "pat-1",
      endDate: "2026-04-17",
    });

    expect(result).toEqual({
      ok: false,
      message: "No hay un episodio activo para finalizar.",
    });
  });

  it("finishes active episode when validation passes", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(finishActiveEpisodeOfCare).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-04-01",
      endDate: "2026-04-17",
    });

    const result = await finishEpisodeOfCareAction({
      patientId: "pat-1",
      endDate: "2026-04-17",
    });

    expect(finishActiveEpisodeOfCare).toHaveBeenCalledWith({
      patientId: "pat-1",
      endDate: "2026-04-17",
    });
    expect(result).toEqual({
      ok: true,
      message: "Tratamiento finalizado correctamente.",
    });
  });
});
