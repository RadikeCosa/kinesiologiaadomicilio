import { describe, expect, it, vi } from "vitest";

import { updateEncounterPeriodAction } from "@/app/admin/patients/[id]/encounters/actions/update-encounter-period.action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  getEncounterById: vi.fn(),
  updateEncounterTimeRange: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getEpisodeById: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import {
  getEncounterById,
  updateEncounterTimeRange,
} from "@/infrastructure/repositories/encounter.repository";
import { getEpisodeById } from "@/infrastructure/repositories/episode-of-care.repository";

describe("updateEncounterPeriodAction", () => {
  it("fails when encounter does not exist", async () => {
    vi.mocked(getEncounterById).mockResolvedValue(null);

    const result = await updateEncounterPeriodAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T12:00",
      endedAt: "2026-04-24T12:30",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se encontró la visita seleccionada.",
    });
    expect(updateEncounterTimeRange).not.toHaveBeenCalled();
  });

  it("fails when encounter belongs to another patient", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-2",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T12:00:00Z",
      status: "finished",
    });

    const result = await updateEncounterPeriodAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T12:00",
      endedAt: "2026-04-24T12:30",
    });

    expect(result).toEqual({
      ok: false,
      message: "La visita no corresponde al paciente actual.",
    });
    expect(getEpisodeById).not.toHaveBeenCalled();
  });

  it("updates start/end date-time and revalidates encounters page", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T10:00:00Z",
      status: "finished",
    });

    vi.mocked(getEpisodeById).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });

    vi.mocked(updateEncounterTimeRange).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T12:00:00Z",
      endedAt: "2026-04-24T12:30:00Z",
      status: "finished",
    });

    const result = await updateEncounterPeriodAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T12:00",
      endedAt: "2026-04-24T12:30",
    });

    expect(updateEncounterTimeRange).toHaveBeenCalledWith({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: expect.stringMatching(/^2026-04-24T12:00:00(?:Z|[+-]\d{2}:\d{2})$/),
      endedAt: expect.stringMatching(/^2026-04-24T12:30:00(?:Z|[+-]\d{2}:\d{2})$/),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
    expect(result).toEqual({
      ok: true,
      message: "Inicio y cierre de la visita actualizados correctamente.",
    });
  });

  it("fails when treatment is missing for encounter episode", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T09:00:00Z",
      endedAt: "2026-04-24T10:00:00Z",
      status: "finished",
    });
    vi.mocked(getEpisodeById).mockResolvedValue(null);

    const result = await updateEncounterPeriodAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T10:30",
      endedAt: "2026-04-24T11:30",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se encontró el tratamiento asociado a la visita.",
    });
  });
});
