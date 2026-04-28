import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
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

  it("renders status actions for in_review and accepted requests", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-1",
        serviceRequests: [
          {
            id: "sr-2",
            patientId: "pat-1",
            requestedAt: "2026-04-22",
            reasonText: "Control",
            status: "in_review",
          },
          {
            id: "sr-3",
            patientId: "pat-1",
            requestedAt: "2026-04-23",
            reasonText: "Revisión",
            status: "accepted",
          },
        ],
      }),
    );

    expect(html).toContain("Aceptar");
    expect(html).toContain("No inició");
    expect(html).toContain("Cancelar");
  });

  it("renders closedReasonText when present", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-1",
        serviceRequests: [
          {
            id: "sr-4",
            patientId: "pat-1",
            requestedAt: "2026-04-24",
            reasonText: "Control",
            status: "closed_without_treatment",
            closedReasonText: "No requiere tratamiento",
          },
        ],
      }),
    );

    expect(html).toContain("Motivo de cierre/cancelación");
    expect(html).toContain("No requiere tratamiento");
  });
});
