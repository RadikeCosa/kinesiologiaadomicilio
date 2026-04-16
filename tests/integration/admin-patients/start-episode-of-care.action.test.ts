import "./test-setup";

import { describe, expect, it } from "vitest";

import { startEpisodeOfCareAction } from "@/app/admin/patients/[id]/actions/start-episode-of-care.action";
import { createPatient } from "@/infrastructure/repositories/patient.repository";

describe("startEpisodeOfCareAction", () => {
  it("fails when patient does not exist", async () => {
    const result = await startEpisodeOfCareAction({
      patientId: "pat-999",
      startDate: "2026-04-16",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se encontró el paciente para iniciar tratamiento.",
    });
  });

  it("fails when patient has no DNI", async () => {
    const result = await startEpisodeOfCareAction({
      patientId: "pat-001",
      startDate: "2026-04-16",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se puede iniciar tratamiento sin DNI.",
    });
  });

  it("fails when duplicate DNI exists", async () => {
    await createPatient({
      firstName: "Paciente",
      lastName: "Duplicado",
      dni: "32123456",
    });

    const result = await startEpisodeOfCareAction({
      patientId: "pat-002",
      startDate: "2026-04-16",
    });

    expect(result).toEqual({
      ok: false,
      message: "Ya existe otro paciente con ese DNI.",
    });
  });

  it("fails when patient already has an active episode", async () => {
    const result = await startEpisodeOfCareAction({
      patientId: "pat-003",
      startDate: "2026-04-16",
    });

    expect(result).toEqual({
      ok: false,
      message: "El paciente ya tiene un episodio activo.",
    });
  });

  it("creates episode when conditions are met", async () => {
    const created = await createPatient({
      firstName: "Luis",
      lastName: "Nuevo",
      dni: "30111999",
    });

    const result = await startEpisodeOfCareAction({
      patientId: created.id,
      startDate: "2026-04-16",
      description: "Plan inicial",
    });

    expect(result).toEqual({
      ok: true,
      message: "Tratamiento iniciado correctamente.",
    });
  });
});
