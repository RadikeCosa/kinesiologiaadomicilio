import { describe, expect, it, vi } from "vitest";

import { updateEncounterClinicalNoteAction } from "@/app/admin/patients/[id]/encounters/actions/update-encounter-clinical-note.action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  getEncounterById: vi.fn(),
  updateEncounterClinicalNote: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: vi.fn(),
  getMostRecentEpisodeByPatientId: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import {
  getEncounterById,
  updateEncounterClinicalNote,
} from "@/infrastructure/repositories/encounter.repository";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";

const encounter = {
  id: "enc-1",
  patientId: "pat-1",
  episodeOfCareId: "epi-active",
  startedAt: "2026-04-24T10:00:00Z",
  endedAt: "2026-04-24T11:00:00Z",
  status: "finished" as const,
};

describe("updateEncounterClinicalNoteAction", () => {
  it("updates clinical note and revalidates encounters page", async () => {
    vi.mocked(getEncounterById).mockResolvedValue(encounter);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(updateEncounterClinicalNote).mockResolvedValue({
      ...encounter,
      clinicalNote: {
        subjective: "Refiere menor dolor",
      },
    });

    const result = await updateEncounterClinicalNoteAction({
      patientId: "pat-1",
      encounterId: "enc-1",
      clinicalNote: {
        subjective: "  Refiere menor dolor  ",
      },
    });

    expect(updateEncounterClinicalNote).toHaveBeenCalledWith({
      patientId: "pat-1",
      encounterId: "enc-1",
      clinicalNote: {
        subjective: "Refiere menor dolor",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
    expect(result).toEqual({
      ok: true,
      message: "Nota clínica actualizada correctamente.",
    });
  });

  it("rejects encounter from another patient", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      ...encounter,
      patientId: "pat-2",
    });

    const result = await updateEncounterClinicalNoteAction({
      patientId: "pat-1",
      encounterId: "enc-1",
      clinicalNote: {
        subjective: "texto",
      },
    });

    expect(result).toEqual({
      ok: false,
      message: "La visita no corresponde al paciente actual.",
    });
    expect(updateEncounterClinicalNote).not.toHaveBeenCalled();
  });

  it("rejects encounter outside effective episode", async () => {
    vi.mocked(getEncounterById).mockResolvedValue({
      ...encounter,
      episodeOfCareId: "epi-old",
    });
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);

    const result = await updateEncounterClinicalNoteAction({
      patientId: "pat-1",
      encounterId: "enc-1",
      clinicalNote: {
        subjective: "texto",
      },
    });

    expect(result).toEqual({
      ok: false,
      message: "La visita no corresponde al tratamiento visible actual.",
    });
    expect(updateEncounterClinicalNote).not.toHaveBeenCalled();
  });

  it("allows clearing all clinical note fields", async () => {
    vi.mocked(getEncounterById).mockResolvedValue(encounter);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue({
      id: "epi-active",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-04-01",
    });
    vi.mocked(updateEncounterClinicalNote).mockResolvedValue(encounter);

    const result = await updateEncounterClinicalNoteAction({
      patientId: "pat-1",
      encounterId: "enc-1",
      clinicalNote: {
        subjective: "",
        objective: "   ",
      },
    });

    expect(updateEncounterClinicalNote).toHaveBeenCalledWith({
      patientId: "pat-1",
      encounterId: "enc-1",
      clinicalNote: undefined,
    });
    expect(result.ok).toBe(true);
  });

  it("returns controlled message on repository error", async () => {
    vi.mocked(getEncounterById).mockResolvedValue(encounter);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(updateEncounterClinicalNote).mockRejectedValue(new Error("FHIR no disponible"));

    const result = await updateEncounterClinicalNoteAction({
      patientId: "pat-1",
      encounterId: "enc-1",
      clinicalNote: {
        subjective: "texto",
      },
    });

    expect(result).toEqual({
      ok: false,
      message: "FHIR no disponible",
    });
  });
});
