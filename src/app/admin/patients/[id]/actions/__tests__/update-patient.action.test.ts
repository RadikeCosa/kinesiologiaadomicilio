import { describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  getPatientById: vi.fn(),
  updatePatient: vi.fn(),
}));

import { updatePatientAction } from "@/app/admin/patients/[id]/actions/update-patient.action";
import { getPatientById, updatePatient } from "@/infrastructure/repositories/patient.repository";

describe("updatePatientAction", () => {
  it("accepts and forwards patient address", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    vi.mocked(updatePatient).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      address: "Mitre 450",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T01:00:00.000Z",
    });

    const result = await updatePatientAction({
      id: "pat-1",
      address: "  Mitre 450  ",
    });

    expect(result).toEqual({
      ok: true,
      message: "Paciente actualizado correctamente.",
    });

    expect(updatePatient).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pat-1",
        firstName: "Ana",
        lastName: "Pérez",
        address: "Mitre 450",
      }),
    );
  });

  it("accepts and forwards patient gender", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    vi.mocked(updatePatient).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      gender: "other",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T01:00:00.000Z",
    });

    const result = await updatePatientAction({
      id: "pat-1",
      gender: "other",
    });

    expect(result).toEqual({
      ok: true,
      message: "Paciente actualizado correctamente.",
    });

    expect(updatePatient).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pat-1",
        firstName: "Ana",
        lastName: "Pérez",
        gender: "other",
      }),
    );
  });

  it("accepts and forwards patient birthDate", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    vi.mocked(updatePatient).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      birthDate: "1990-10-03",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T01:00:00.000Z",
    });

    const result = await updatePatientAction({
      id: "pat-1",
      birthDate: "1990-10-03",
    });

    expect(result).toEqual({
      ok: true,
      message: "Paciente actualizado correctamente.",
    });

    expect(updatePatient).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pat-1",
        firstName: "Ana",
        lastName: "Pérez",
        birthDate: "1990-10-03",
      }),
    );
  });
});
