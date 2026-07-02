import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/admin/patients/actions/create-patient.action", () => ({
  createPatientAction: vi.fn(),
}));

import { PatientCreateForm } from "@/app/admin/patients/new/components/PatientCreateForm";

(globalThis as { React?: typeof React }).React = React;

describe("PatientCreateForm", () => {
  it("keeps the phone helper only in the contact field", () => {
    const html = renderToStaticMarkup(createElement(PatientCreateForm));

    expect(html).toContain("Nombre *");
    expect(html).toContain("Teléfono de contacto");
    expect(html).toContain("Preferentemente un número con WhatsApp para coordinar horarios y seguimiento. También podés ingresar un teléfono fijo.");
    expect(html.indexOf("Nombre *")).toBeLessThan(html.indexOf("Teléfono de contacto"));
  });
});
