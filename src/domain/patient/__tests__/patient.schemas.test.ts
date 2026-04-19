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
      mainContact: {
        name: "Marta",
        relationship: "Madre",
        phone: "555",
      },
    });
  });

  it("allows partial update with id and optional fields", () => {
    const result = updatePatientSchema.parse({
      id: " pat-001 ",
      phone: " 123 ",
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
      birthDate: undefined,
      address: undefined,
      mainContact: {
        name: "Marta",
        relationship: undefined,
        phone: undefined,
      },
    });
  });
});
