import { describe, expect, it } from "vitest";

import { createPatientSchema, updatePatientSchema } from "@/domain/patient/patient.schemas";

describe("patient.schemas", () => {
  it("requires firstName and lastName in create schema", () => {
    expect(() => createPatientSchema.parse({ firstName: "Ana" })).toThrow("lastName: debe ser un string.");
    expect(() => createPatientSchema.parse({ lastName: "Pérez" })).toThrow("firstName: debe ser un string.");
  });

  it("accepts optional fields and normalizes values", () => {
    const result = createPatientSchema.parse({
      firstName: "  Ana ",
      lastName: " Pérez  ",
      dni: " 32123456 ",
      phone: " 123 ",
      gender: " female ",
      birthDate: " 1990-10-03 ",
      mainContact: {
        name: "  Marta ",
        relationship: " Madre ",
        phone: " 555 ",
      },
    });

    expect(result).toMatchObject({
      firstName: "Ana",
      lastName: "Pérez",
      dni: "32123456",
      phone: "123",
      gender: "female",
      birthDate: "1990-10-03",
      mainContact: {
        name: "Marta",
        relationship: "Madre",
        phone: "555",
      },
    });
  });

  it("rejects invalid gender values", () => {
    expect(() =>
      createPatientSchema.parse({
        firstName: "Ana",
        lastName: "Pérez",
        gender: "femenino",
      })
    ).toThrow("gender: valor inválido.");
  });

  it("rejects invalid birthDate values", () => {
    expect(() =>
      createPatientSchema.parse({
        firstName: "Ana",
        lastName: "Pérez",
        birthDate: "1990-02-31",
      })
    ).toThrow("birthDate: formato inválido (YYYY-MM-DD).");

    expect(() =>
      createPatientSchema.parse({
        firstName: "Ana",
        lastName: "Pérez",
        birthDate: "03-10-1990",
      })
    ).toThrow("birthDate: formato inválido (YYYY-MM-DD).");
  });

  it("allows partial update with id and optional fields", () => {
    const result = updatePatientSchema.parse({
      id: " pat-001 ",
      phone: " 123 ",
      gender: " other ",
      birthDate: " 1988-01-15 ",
      mainContact: {
        name: "  Marta ",
      },
    });

    expect(result).toEqual({
      id: "pat-001",
      firstName: undefined,
      lastName: undefined,
      dni: undefined,
      phone: "123",
      gender: "other",
      birthDate: "1988-01-15",
      address: undefined,
      mainContact: {
        name: "Marta",
        relationship: undefined,
        phone: undefined,
      },
    });
  });

  it("rejects invalid optional values in update schema", () => {
    expect(() => updatePatientSchema.parse({ id: "pat-001", gender: "x" })).toThrow("gender: valor inválido.");
    expect(() => updatePatientSchema.parse({ id: "pat-001", birthDate: "2026-13-01" })).toThrow(
      "birthDate: formato inválido (YYYY-MM-DD)."
    );
  });
});
