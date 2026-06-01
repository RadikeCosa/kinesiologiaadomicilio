import { describe, expect, it, vi } from "vitest";

import { loadPatientsList } from "@/app/admin/patients/data";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { Patient } from "@/domain/patient/patient.types";

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  listPatients: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getMostRecentEpisode: vi.fn(),
  listEpisodesByPatientIds: vi.fn(),
}));

import { listEpisodesByPatientIds, getMostRecentEpisode } from "@/infrastructure/repositories/episode-of-care.repository";
import { listPatients } from "@/infrastructure/repositories/patient.repository";

function buildPatient(overrides: Partial<Patient> & Pick<Patient, "id" | "firstName" | "lastName">): Patient {
  return {
    dni: "32123456",
    phone: "2991234567",
    address: "Calle 1",
    createdAt: "2026-04-17T12:00:00.000Z",
    updatedAt: "2026-04-17T12:00:00.000Z",
    ...overrides,
  };
}

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

    vi.mocked(listEpisodesByPatientIds).mockResolvedValue([]);
    vi.mocked(getMostRecentEpisode).mockReturnValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-03-01",
      endDate: "2026-04-01",
    });

    const patients = await loadPatientsList();

    expect(listEpisodesByPatientIds).toHaveBeenCalledWith(["pat-1"]);
    expect(listEpisodesByPatientIds).toHaveBeenCalledTimes(1);
    expect(getMostRecentEpisode).toHaveBeenCalledTimes(1);
    expect(patients[0]?.operationalStatus).toBe("finished_treatment");
  });

  it("sorts patients by operational priority and then visible name", async () => {
    vi.mocked(listPatients).mockResolvedValue([
      buildPatient({
        id: "pat-finished",
        firstName: "Fede",
        lastName: "Finalizado",
      }),
      buildPatient({
        id: "pat-preliminary",
        firstName: "Pía",
        lastName: "Preliminar",
        phone: undefined,
      }),
      buildPatient({
        id: "pat-ready-z",
        firstName: "Zoe",
        lastName: "Lista",
      }),
      buildPatient({
        id: "pat-active-b",
        firstName: "Bruno",
        lastName: "Activo",
      }),
      buildPatient({
        id: "pat-ready-a",
        firstName: "Ana",
        lastName: "Lista",
      }),
      buildPatient({
        id: "pat-active-a",
        firstName: "Ana",
        lastName: "Activa",
      }),
    ]);

    vi.mocked(listEpisodesByPatientIds).mockResolvedValue([
      {
        id: "epi-finished",
        patientId: "pat-finished",
        status: "finished",
        startDate: "2026-03-01",
        endDate: "2026-04-01",
      },
      {
        id: "epi-active-b",
        patientId: "pat-active-b",
        status: "active",
        startDate: "2026-04-01",
      },
      {
        id: "epi-active-a",
        patientId: "pat-active-a",
        status: "active",
        startDate: "2026-04-02",
      },
    ]);
    vi.mocked(getMostRecentEpisode).mockImplementation(
      (episodes: EpisodeOfCare[]) => episodes.at(-1) ?? null,
    );

    const patients = await loadPatientsList();

    expect(patients.map((patient) => patient.id)).toEqual([
      "pat-active-a",
      "pat-active-b",
      "pat-ready-a",
      "pat-ready-z",
      "pat-preliminary",
      "pat-finished",
    ]);
    expect(patients.map((patient) => patient.operationalStatus)).toEqual([
      "active_treatment",
      "active_treatment",
      "ready_to_start",
      "ready_to_start",
      "preliminary",
      "finished_treatment",
    ]);
    expect(listEpisodesByPatientIds).toHaveBeenCalledWith([
      "pat-finished",
      "pat-preliminary",
      "pat-ready-z",
      "pat-active-b",
      "pat-ready-a",
      "pat-active-a",
    ]);
    expect(listEpisodesByPatientIds).toHaveBeenCalledTimes(1);
  });
});
