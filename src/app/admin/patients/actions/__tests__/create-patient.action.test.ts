import { describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  createPatient: vi.fn(),
}));

import { createPatientAction } from "@/app/admin/patients/actions/create-patient.action";
import { createPatient } from "@/infrastructure/repositories/patient.repository";

describe("createPatientAction", () => {
  it("accepts and forwards patient address", async () => {
    vi.mocked(createPatient).mockResolvedValue({
      id: "pat-123",
      firstName: "Ana",
      lastName: "Pérez",
      address: "Buenos Aires 123",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    const result = await createPatientAction({
      firstName: "Ana",
      lastName: "Pérez",
      address: "  Buenos Aires 123  ",
    });

    expect(result).toEqual({
      ok: true,
      patientId: "pat-123",
      message: "Paciente creado correctamente.",
    });

    expect(createPatient).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "Buenos Aires 123",
      }),
    );
  });

  it("accepts and forwards patient gender when present", async () => {
    vi.mocked(createPatient).mockResolvedValue({
      id: "pat-789",
      firstName: "Ana",
      lastName: "Pérez",
      gender: "female",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    const result = await createPatientAction({
      firstName: "Ana",
      lastName: "Pérez",
      gender: "female",
    });

    expect(result).toEqual({
      ok: true,
      patientId: "pat-789",
      message: "Paciente creado correctamente.",
    });

    expect(createPatient).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: "female",
      }),
    );
  });

  it("accepts and forwards patient birthDate when present", async () => {
    vi.mocked(createPatient).mockResolvedValue({
      id: "pat-790",
      firstName: "Ana",
      lastName: "Pérez",
      birthDate: "1990-10-03",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    const result = await createPatientAction({
      firstName: "Ana",
      lastName: "Pérez",
      birthDate: "1990-10-03",
    });

    expect(result).toEqual({
      ok: true,
      patientId: "pat-790",
      message: "Paciente creado correctamente.",
    });

    expect(createPatient).toHaveBeenCalledWith(
      expect.objectContaining({
        birthDate: "1990-10-03",
      }),
    );
  });

  it("accepts minimal valid input", async () => {
    vi.mocked(createPatient).mockResolvedValue({
      id: "pat-456",
      firstName: "Carla",
      lastName: "López",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    const result = await createPatientAction({
      firstName: "Carla",
      lastName: "López",
    });

    expect(result).toEqual({
      ok: true,
      patientId: "pat-456",
      message: "Paciente creado correctamente.",
    });

    expect(createPatient).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Carla",
        lastName: "López",
      }),
    );
  });
});
