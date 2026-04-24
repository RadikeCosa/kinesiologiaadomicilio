import { describe, expect, it, vi } from "vitest";

import { createEncounterAction } from "@/app/admin/patients/[id]/encounters/actions/create-encounter.action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  createEncounter: vi.fn(),
}));

import { createEncounter } from "@/infrastructure/repositories/encounter.repository";
import { getActiveEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";
import { revalidatePath } from "next/cache";

describe("createEncounterAction", () => {
  it("fails when there is no active episode", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se puede registrar visita sin un tratamiento activo.",
    });
  });

  it("fails when active episode differs from submitted episode", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-2",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
    });

    expect(result).toEqual({
      ok: false,
      message: "El tratamiento activo cambió. Reintentá desde la pantalla actualizada.",
    });
    expect(createEncounter).not.toHaveBeenCalled();
  });

  it("creates encounter when validation passes", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(createEncounter).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      status: "finished",
    });

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
    });

    expect(createEncounter).toHaveBeenCalledWith({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: expect.stringMatching(/^2026-04-17T10:30:00(?:Z|[+-]\d{2}:\d{2})$/),
    });

    expect(result).toEqual({
      ok: true,
      message: "Visita registrada correctamente.",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
  });
});
