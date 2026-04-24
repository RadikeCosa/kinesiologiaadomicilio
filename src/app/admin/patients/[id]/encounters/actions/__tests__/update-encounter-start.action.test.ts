import { describe, expect, it, vi } from "vitest";

import { updateEncounterStartAction } from "@/app/admin/patients/[id]/encounters/actions/update-encounter-start.action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  getEncounterById: vi.fn(),
  updateEncounterStartDateTime: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import {
  getEncounterById,
  updateEncounterStartDateTime,
} from "@/infrastructure/repositories/encounter.repository";

describe("updateEncounterStartAction", () => {
  it("fails when encounter does not exist", async () => {
    vi.mocked(getEncounterById).mockResolvedValue(null);

    const result = await updateEncounterStartAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T12:00",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se encontró la visita seleccionada.",
    });
    expect(updateEncounterStartDateTime).not.toHaveBeenCalled();
  });

  it("fails when encounter belongs to another patient", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-2",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T12:00:00Z",
      status: "finished",
    });

    const result = await updateEncounterStartAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T12:00",
    });

    expect(result).toEqual({
      ok: false,
      message: "La visita no corresponde al paciente actual.",
    });
  });

  it("updates occurrence date-time and revalidates encounters page", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T10:00:00Z",
      status: "finished",
    });

    vi.mocked(updateEncounterStartDateTime).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T12:00:00Z",
      status: "finished",
    });

    const result = await updateEncounterStartAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T12:00",
    });

    expect(updateEncounterStartDateTime).toHaveBeenCalledWith({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: expect.stringMatching(/^2026-04-24T12:00:00(?:Z|[+-]\d{2}:\d{2})$/),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
    expect(result).toEqual({
      ok: true,
      message: "Fecha y hora de visita actualizadas correctamente.",
    });
  });

  it("blocks inline start update when new start is after existing end", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-24T09:00:00Z",
      endedAt: "2026-04-24T10:00:00Z",
      status: "finished",
    });
    vi.mocked(updateEncounterStartDateTime).mockRejectedValue(
      new Error("No se puede mover el inicio después de la finalización registrada."),
    );

    const result = await updateEncounterStartAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      startedAt: "2026-04-24T10:30",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se puede mover el inicio después de la finalización registrada.",
    });
  });
});
