import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/patients/[id]/administrative/actions", () => ({
  createPatientServiceRequestAction: vi.fn(),
}));

import { ServiceRequestCreateForm } from "@/app/admin/patients/[id]/administrative/components/ServiceRequestCreateForm";

(globalThis as { React?: typeof React }).React = React;

describe("ServiceRequestCreateForm", () => {
  it("renders core fields and grouped requester section", () => {
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

    expect(html).toContain("Quién consulta");
    expect(html).toContain("Indicá si consulta el paciente, un familiar, cuidador, médico u otra persona.");
    expect(html).toContain("Relación con el paciente");
    expect(html).toContain("name=\"requesterType\"");
    expect(html).toContain("Nombre de quien consulta");
    expect(html).toContain("name=\"requesterDisplay\"");

    expect(html).toContain("Más detalles");
    expect(html).toContain("Diagnóstico informado");
    expect(html).toContain("name=\"reportedDiagnosisText\"");
    expect(html).toContain("Contacto de quien consulta");
    expect(html).toContain("name=\"requesterContact\"");
    expect(html).toContain("Notas internas");
    expect(html).toContain("name=\"notes\"");

    expect(html).toContain("Registrar solicitud");
    expect(html).toContain("Cancelar");
  });

  it("keeps original field names used by action payload", () => {
    const html = renderToStaticMarkup(
      createElement(ServiceRequestCreateForm, {
        patientId: "pat-1",
        onCancel: vi.fn(),
        onSubmitted: vi.fn(),
      }),
    );

    [
      "requestedAt",
      "reasonText",
      "requesterType",
      "requesterDisplay",
      "reportedDiagnosisText",
      "requesterContact",
      "notes",
    ].forEach((fieldName) => {
      expect(html).toContain(`name=\"${fieldName}\"`);
    });
  });
});
