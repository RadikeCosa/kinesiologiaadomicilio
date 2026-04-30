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

  it("does not fail by DNI absence and fails by missing accepted service request", async () => {
    const created = await createPatient({
      firstName: "Paciente",
      lastName: "SinDni",
      address: "Calle 100",
      phone: "2995550000",
    });

    const result = await startEpisodeOfCareAction({
      patientId: created.id,
      startDate: "2026-04-16",
    });

    expect(result).toEqual({
      ok: false,
      message: "Para iniciar tratamiento necesitás una solicitud de atención aceptada.",
    });
  });

  it("fails when duplicate DNI exists", async () => {
    await createPatient({
      firstName: "Paciente",
      lastName: "Duplicado",
      dni: "32123456",
      address: "Calle 101",
      phone: "2995550001",
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

  it("fails when duplicate DNI exists and current patient identifier has type", async () => {
    const current = await createPatient({
      firstName: "Paciente",
      lastName: "ConType",
      dni: "30555111",
      address: "Calle 102",
      phone: "2995550002",
    });

    await createPatient({
      firstName: "Paciente",
      lastName: "DuplicadoConType",
      dni: "30555111",
      address: "Calle 103",
      phone: "2995550003",
    });

    const result = await startEpisodeOfCareAction({
      patientId: current.id,
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

  it("fails when serviceRequestId is missing even if patient can start treatment", async () => {
    const created = await createPatient({
      firstName: "Luis",
      lastName: "Nuevo",
      dni: "30111999",
      address: "Calle 104",
      phone: "2995550004",
    });

    const result = await startEpisodeOfCareAction({
      patientId: created.id,
      startDate: "2026-04-16",
    });

    expect(result).toEqual({
      ok: false,
      message: "Para iniciar tratamiento necesitás una solicitud de atención aceptada.",
    });
  });

});
