import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

(globalThis as { React?: typeof React }).React = React;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/actions/update-patient.action", () => ({
  updatePatientAction: vi.fn(),
}));

import { PatientAdministrativeEditor } from "@/app/admin/patients/[id]/components/PatientAdministrativeEditor";

const basePatient = {
  id: "pat-1",
  firstName: "Ana",
  lastName: "Pérez",
  fullName: "Ana Pérez",
  operationalStatus: "preliminary" as const,
  dni: "30111222",
  gender: "female" as const,
  phone: "+542995550101",
  address: "Belgrano 123",
  mainContact: {
    name: "Carlos Pérez",
    relationship: "caregiver" as const,
    phone: "+542995550102",
  },
  createdAt: "2026-04-17T00:00:00.000Z",
  updatedAt: "2026-04-17T00:00:00.000Z",
};

describe("PatientAdministrativeEditor", () => {
  it("renders reading mode by default with Editar datos CTA", () => {
    const html = renderToStaticMarkup(
      createElement(PatientAdministrativeEditor, {
        patient: basePatient,
      }),
    );

    expect(html).toContain("Datos administrativos y de contacto");
    expect(html).toContain("Editar datos");
    expect(html).toContain("Género");
    expect(html).toContain("Contacto del paciente");
    expect(html).toContain("Dirección");
    expect(html).toContain("Contacto principal");
    expect(html).not.toContain("Guardar cambios");
  });

  it("renders edit form when editing mode is active", () => {
    const html = renderToStaticMarkup(
      createElement(PatientAdministrativeEditor, {
        patient: basePatient,
        initialEditing: true,
      }),
    );

    expect(html).toContain("Editar datos del paciente");
    expect(html).toContain("name=\"dni\"");
    expect(html).toContain("Guardar cambios");
    expect(html).toContain("Cancelar edición");
  });
});
