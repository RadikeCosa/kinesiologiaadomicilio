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
      phone: " +54 (299) 555-0101 ",
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
      phone: "+542995550101",
      gender: "female",
      birthDate: "1990-10-03",
      mainContact: {
        name: "Marta",
        relationship: "parent",
        phone: "555",
      },
    });
  });

  it("normalizes dni with separators in create schema", () => {
    const result = createPatientSchema.parse({
      firstName: "Ana",
      lastName: "Pérez",
      dni: "12.345.678",
    });

    expect(result.dni).toBe("12345678");
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

  it("rejects invalid dni values", () => {
    expect(() =>
      createPatientSchema.parse({
        firstName: "Ana",
        lastName: "Pérez",
        dni: "12.34",
      })
    ).toThrow("dni: longitud inválida (7 u 8 dígitos).");

    expect(() =>
      createPatientSchema.parse({
        firstName: "Ana",
        lastName: "Pérez",
        dni: "abc",
      })
    ).toThrow("dni: formato inválido.");
  });

  it("rejects invalid phone values in create schema", () => {
    expect(() =>
      createPatientSchema.parse({
        firstName: "Ana",
        lastName: "Pérez",
        phone: "12345",
      })
    ).toThrow("phone: longitud inválida (10 a 15 dígitos).");
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
      phone: " (299) 555-0101 ",
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
      phone: "2995550101",
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
    expect(() => updatePatientSchema.parse({ id: "pat-001", phone: "12345" })).toThrow(
      "phone: longitud inválida (10 a 15 dígitos)."
    );
  });

  it("normalizes legacy relationship text into transitional catalog", () => {
    const result = updatePatientSchema.parse({
      id: "pat-001",
      mainContact: {
        relationship: "Vecina",
      },
    });

    expect(result.mainContact?.relationship).toBe("other");
  });
});
