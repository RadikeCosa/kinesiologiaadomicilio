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
    expect(html).toContain("DNI");
    expect(html).toContain("Fecha de nacimiento");
    expect(html).toContain("Edad");
    expect(html).toContain("Datos del paciente");
    expect(html).toContain("Dirección");
    expect(html).toContain("Contacto principal");
    expect(html).not.toContain("Guardar cambios");
  });

  it("keeps patient and main contact actions separated when patient phone is missing", () => {
    const html = renderToStaticMarkup(
      createElement(PatientAdministrativeEditor, {
        patient: {
          ...basePatient,
          phone: undefined,
        },
      }),
    );

    expect(html).toContain("Teléfono del paciente:</span> No informado");
    expect(html).not.toContain("WhatsApp paciente");
    expect(html).toContain(">Mensaje<");
    expect(html).toContain('aria-label="Enviar WhatsApp al contacto principal"');
    expect(html).toContain('title="Enviar WhatsApp al contacto principal"');
    expect(html).toContain("https://wa.me/542995550102");
  });

  it("shows explicit fallbacks for missing administrative fields", () => {
    const html = renderToStaticMarkup(
      createElement(PatientAdministrativeEditor, {
        patient: {
          ...basePatient,
          dni: undefined,
          birthDate: undefined,
          gender: undefined,
          phone: undefined,
          address: undefined,
          mainContact: {
            name: undefined,
            relationship: undefined,
            phone: undefined,
          },
        },
      }),
    );

    expect(html).toContain("No informado");
    expect(html).toContain("No informada");
    expect(html).toContain("Teléfono del paciente:</span> No informado");
    expect(html).toContain("Teléfono del contacto principal:</span> No informado");
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
