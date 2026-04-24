import { describe, expect, it, vi } from "vitest";

import { updateEncounterOccurrenceAction } from "@/app/admin/patients/[id]/encounters/actions/update-encounter-occurrence.action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  getEncounterById: vi.fn(),
  updateEncounterOccurrenceDateTime: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import {
  getEncounterById,
  updateEncounterOccurrenceDateTime,
} from "@/infrastructure/repositories/encounter.repository";

describe("updateEncounterOccurrenceAction", () => {
  it("fails when encounter does not exist", async () => {
    vi.mocked(getEncounterById).mockResolvedValue(null);

    const result = await updateEncounterOccurrenceAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      occurrenceDate: "2026-04-24T12:00",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se encontró la visita seleccionada.",
    });
    expect(updateEncounterOccurrenceDateTime).not.toHaveBeenCalled();
  });

  it("fails when encounter belongs to another patient", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-2",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-24T12:00:00Z",
      status: "finished",
    });

    const result = await updateEncounterOccurrenceAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      occurrenceDate: "2026-04-24T12:00",
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
      occurrenceDate: "2026-04-24T10:00:00Z",
      status: "finished",
    });

    vi.mocked(updateEncounterOccurrenceDateTime).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-24T12:00:00Z",
      status: "finished",
    });

    const result = await updateEncounterOccurrenceAction({
      encounterId: "enc-1",
      patientId: "pat-1",
      occurrenceDate: "2026-04-24T12:00",
    });

    expect(updateEncounterOccurrenceDateTime).toHaveBeenCalledWith({
      encounterId: "enc-1",
      patientId: "pat-1",
      occurrenceDate: expect.stringMatching(/^2026-04-24T12:00:00(?:Z|[+-]\d{2}:\d{2})$/),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
    expect(result).toEqual({
      ok: true,
      message: "Fecha y hora de visita actualizadas correctamente.",
    });
  });
});
