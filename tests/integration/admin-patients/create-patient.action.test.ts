import "./test-setup";

import { describe, expect, it } from "vitest";

import { createPatientAction } from "@/app/admin/patients/actions/create-patient.action";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";

describe("createPatientAction", () => {
  it("creates a minimum patient and returns expected result", async () => {
    const result = await createPatientAction({
      firstName: "Ana",
      lastName: "Pérez",
    });

    expect(result.ok).toBe(true);
    expect(result.patientId).toBeDefined();
    expect(result.message).toBe("Paciente creado correctamente.");

    const createdPatient = await getPatientById(result.patientId!);
    expect(createdPatient).toMatchObject({
      firstName: "Ana",
      lastName: "Pérez",
    });
  });

  it("returns schema error for invalid input", async () => {
    const result = await createPatientAction({
      firstName: "Ana",
    });

    expect(result).toEqual({
      ok: false,
      message: "lastName: debe ser un string.",
    });
  });

  it("returns validation error when minimum data is blank", async () => {
    const result = await createPatientAction({
      firstName: "   ",
      lastName: "Pérez",
    });

    expect(result).toEqual({
      ok: false,
      message: "firstName: es obligatorio.",
    });
  });
});
