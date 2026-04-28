import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/patients/[id]/administrative/actions", () => ({
  createPatientServiceRequestAction: vi.fn(),
}));

import { ServiceRequestCreateForm } from "@/app/admin/patients/[id]/administrative/components/ServiceRequestCreateForm";

(globalThis as { React?: typeof React }).React = React;

describe("ServiceRequestCreateForm", () => {
  it("renders required and optional fields for minimal request creation", () => {
    const html = renderToStaticMarkup(
      createElement(ServiceRequestCreateForm, {
        patientId: "pat-1",
        onCancel: vi.fn(),
        onSubmitted: vi.fn(),
      }),
    );

    expect(html).toContain("Fecha de solicitud *");
    expect(html).toContain("name=\"requestedAt\"");
    expect(html).toContain("Motivo de consulta *");
    expect(html).toContain("name=\"reasonText\"");
    expect(html).toContain("Diagnóstico informado");
    expect(html).toContain("Quién solicita");
    expect(html).toContain("name=\"requesterType\"");
    expect(html).toContain("Contacto del solicitante");
    expect(html).toContain("Notas internas");
    expect(html).toContain("Registrar solicitud");
    expect(html).toContain("Cancelar");

    expect(html).not.toContain("Aceptar solicitud");
    expect(html).not.toContain("Cerrar solicitud");
    expect(html).not.toContain("Resolver solicitud");
  });
});
