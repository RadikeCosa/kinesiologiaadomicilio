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
});
