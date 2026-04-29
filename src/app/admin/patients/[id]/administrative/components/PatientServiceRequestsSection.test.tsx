import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

import {
  getServiceRequestCreateFormVisibility,
  PatientServiceRequestsSection,
} from "@/app/admin/patients/[id]/administrative/components/PatientServiceRequestsSection";

(globalThis as { React?: typeof React }).React = React;

describe("PatientServiceRequestsSection", () => {
  it("renders request list and hides optional fields when not present", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-1",
        serviceRequests: [
          {
            id: "sr-1",
            patientId: "pat-1",
            requestedAt: "2026-04-21",
            reasonText: "Consulta",
            status: "cancelled",
          },
        ],
      }),
    );

    expect(html).toContain("Solicitudes de atención");
    expect(html).toContain("Nueva solicitud");
    expect(html).toContain("Consulta");
    expect(html).toContain("Cancelada");
    expect(html).not.toContain("Diagnóstico informado");
    expect(html).not.toContain("Solicitante");
    expect(html).not.toContain("Aceptar solicitud");
    expect(html).not.toContain("Cerrar solicitud");
    expect(html).not.toContain("Resolver solicitud");
  });

  it("toggles create form visibility state helper", () => {
    expect(getServiceRequestCreateFormVisibility("open")).toBe(true);
    expect(getServiceRequestCreateFormVisibility("cancel")).toBe(false);
  });

  it("shows treatment CTA only for accepted requests", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-9",
        serviceRequests: [
          { id: "sr-a", patientId: "pat-9", requestedAt: "2026-04-21", reasonText: "A", status: "accepted" },
          { id: "sr-r", patientId: "pat-9", requestedAt: "2026-04-21", reasonText: "R", status: "in_review" },
          { id: "sr-cw", patientId: "pat-9", requestedAt: "2026-04-21", reasonText: "CW", status: "closed_without_treatment" },
          { id: "sr-c", patientId: "pat-9", requestedAt: "2026-04-21", reasonText: "C", status: "cancelled" },
          { id: "sr-e", patientId: "pat-9", requestedAt: "2026-04-21", reasonText: "E", status: "entered_in_error" },
        ],
      }),
    );

    expect(html).toContain("href=\"/admin/patients/pat-9/treatment?serviceRequestId=sr-a\"");
    expect(html).toContain("Iniciar tratamiento");
    expect(html).toContain("Se realiza en la pantalla de Tratamiento.");
    expect(html).not.toContain("serviceRequestId=sr-r");
    expect(html).not.toContain("serviceRequestId=sr-cw");
    expect(html).not.toContain("serviceRequestId=sr-c");
    expect(html).not.toContain("serviceRequestId=sr-e");
  });

  it("renders action-oriented empty state copy", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-empty",
        serviceRequests: [],
      }),
    );

    expect(html).toContain("Registrá la primera solicitud para dejar asentado el motivo de consulta y avanzar con la evaluación.");
    expect(html).toContain("Nueva solicitud");
  });


  it("renders create form open when initialCreateOpen is true", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-open",
        serviceRequests: [],
        initialCreateOpen: true,
      }),
    );

    expect(html).toContain("Registrar solicitud");
    expect(html).toContain("Motivo de consulta *");
    expect(html).not.toContain("Nueva solicitud");
  });

  it("keeps create form closed by default without initialCreateOpen", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-closed",
        serviceRequests: [],
      }),
    );

    expect(html).toContain("Nueva solicitud");
    expect(html).not.toContain("Registrar solicitud");
  });

});
