import "./test-setup";

import { describe, expect, it } from "vitest";

import { updatePatientAction } from "@/app/admin/patients/[id]/actions/update-patient.action";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";

describe("updatePatientAction", () => {
  it("updates valid fields", async () => {
    const result = await updatePatientAction({
      id: "pat-001",
      dni: "30111222",
      phone: "(299) 555-0100",
    });

    expect(result).toEqual({
      ok: true,
      message: "Paciente actualizado correctamente.",
    });

    const patient = await getPatientById("pat-001");
    expect(patient).toMatchObject({
      id: "pat-001",
      dni: "30111222",
      phone: "2995550100",
    });
  });

  it("returns clear result when patient does not exist", async () => {
    const result = await updatePatientAction({
      id: "pat-999",
      phone: "(299) 555-0101",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se encontró el paciente que intentás editar.",
    });
  });
});
