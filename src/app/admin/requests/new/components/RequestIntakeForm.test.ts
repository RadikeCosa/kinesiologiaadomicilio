import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/admin/requests/new/actions/create-request-intake.action", () => ({
  createRequestIntakeAction: vi.fn(),
}));

import { RequestIntakeForm } from "@/app/admin/requests/new/components/RequestIntakeForm";

(globalThis as { React?: typeof React }).React = React;

describe("RequestIntakeForm", () => {
  it("renders the minimal intake fields without treatment or clinical extras", () => {
    const html = renderToStaticMarkup(createElement(RequestIntakeForm));

    expect(html).toContain("Fecha de solicitud *");
    expect(html).toContain("Nombre del paciente *");
    expect(html).toContain("Apellido del paciente *");
    expect(html).toContain("Teléfono de contacto *");
    expect(html).toContain("Motivo de consulta *");
    expect(html).toContain("DNI");
    expect(html).toContain("Domicilio o zona de atención");
    expect(html).toContain("Quién consulta");
    expect(html).toContain("Nombre de quien consulta");
    expect(html).toContain("Relación con el paciente");
    expect(html).toContain("Registrar solicitud");

    expect(html).not.toContain("Diagnóstico informado");
    expect(html).not.toContain("Notas clínicas");
    expect(html).not.toContain("Iniciar tratamiento");
    expect(html).not.toContain("Registrar visita");
    expect(html).not.toContain("Estado manual");
  });

  it("keeps the field names expected by the intake action payload", () => {
    const html = renderToStaticMarkup(createElement(RequestIntakeForm));

    [
      "requestedAt",
      "firstName",
      "lastName",
      "contactPhone",
      "reasonText",
      "dni",
      "address",
      "requesterDisplay",
      "requesterType",
    ].forEach((fieldName) => {
      expect(html).toContain(`name=\"${fieldName}\"`);
    });
  });
});
