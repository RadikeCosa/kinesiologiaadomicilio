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

  it("shows treatment CTA and pending helper only for accepted requests", () => {
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
    expect(html).toContain("Pendiente de iniciar tratamiento.");
    expect(html).toContain("Se realiza en la pantalla de Tratamiento.");
    expect(html).not.toContain("serviceRequestId=sr-r");
    expect(html).not.toContain("serviceRequestId=sr-cw");
    expect(html).not.toContain("serviceRequestId=sr-c");
    expect(html).not.toContain("serviceRequestId=sr-e");
  });


  it("renders compact and status-specific reasons for closed requests", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-10",
        serviceRequests: [
          { id: "sr-cw", patientId: "pat-10", requestedAt: "2026-04-21", reasonText: "CW", status: "closed_without_treatment", closedReasonText: "No contesta llamadas" },
          { id: "sr-c", patientId: "pat-10", requestedAt: "2026-04-21", reasonText: "C", status: "cancelled", closedReasonText: "Derivó por otra cobertura" },
        ],
      }),
    );

    expect(html).toContain("Motivo de no inicio");
    expect(html).toContain("Motivo de cancelación");
    expect(html).toContain("No contesta llamadas");
    expect(html).toContain("Derivó por otra cobertura");
    expect(html).not.toContain("bg-amber-50");
    expect(html).not.toContain("serviceRequestId=sr-cw");
    expect(html).not.toContain("serviceRequestId=sr-c");
  });

  it("renders contextual message when provided", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-context",
        serviceRequests: [],
        contextualMessage: "El próximo paso operativo es registrar o aceptar una solicitud de atención.",
      }),
    );

    expect(html).toContain("El próximo paso operativo es registrar o aceptar una solicitud de atención.");
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


  it("shows fallback when closed reason is missing", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-11",
        serviceRequests: [
          { id: "sr-c", patientId: "pat-11", requestedAt: "2026-04-21", reasonText: "C", status: "cancelled" },
        ],
      }),
    );

    expect(html).toContain("Motivo de cancelación");
    expect(html).toContain("Motivo no registrado");
  });

  it("renders linked active treatment state and hides resolution actions", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-12",
        serviceRequests: [
          { id: "sr-linked", patientId: "pat-12", requestedAt: "2026-04-21", reasonText: "C", status: "in_review" },
        ],
        activeServiceRequest: null,
        historicalServiceRequests: [
          {
            serviceRequest: { id: "sr-linked", patientId: "pat-12", requestedAt: "2026-04-21", reasonText: "C", status: "in_review" },
            displayStatus: "accepted_linked_active_treatment",
            startedTreatment: true,
            isPendingOperational: false,
            linkedEpisodeOfCareId: "ep-1",
            linkedEpisode: { id: "ep-1", status: "active", startDate: "2026-04-22" },
          },
        ],
      }),
    );

    expect(html).toContain("Aceptada — tratamiento activo.");
    expect(html).toContain("Tratamiento iniciado");
    expect(html).not.toContain("Pendiente de iniciar tratamiento.");
    expect(html).not.toContain("Aceptar e iniciar tratamiento");
    expect(html).not.toContain("No inició");
    expect(html).not.toContain("Cancelar");
  });

  it("renders linked finished treatment with closure reason and detail", () => {
    const html = renderToStaticMarkup(
      createElement(PatientServiceRequestsSection, {
        patientId: "pat-13",
        serviceRequests: [
          { id: "sr-finished", patientId: "pat-13", requestedAt: "2026-04-21", reasonText: "C", status: "accepted" },
        ],
        historicalServiceRequests: [
          {
            serviceRequest: { id: "sr-finished", patientId: "pat-13", requestedAt: "2026-04-21", reasonText: "C", status: "accepted" },
            displayStatus: "accepted_linked_finished_treatment",
            startedTreatment: true,
            isPendingOperational: false,
            linkedEpisodeOfCareId: "ep-f",
            linkedEpisode: {
              id: "ep-f",
              status: "finished",
              startDate: "2026-04-22",
              endDate: "2026-04-30",
              closureReason: "clinical_discharge",
              closureDetail: "Alta por objetivos cumplidos",
            },
          },
        ],
      }),
    );

    expect(html).toContain("Aceptada — tratamiento finalizado.");
    expect(html).toContain("Tratamiento finalizado");
    expect(html).toContain("Motivo de cierre");
    expect(html).toContain("Alta clínica");
    expect(html).toContain("Detalle");
    expect(html).toContain("Alta por objetivos cumplidos");
    expect(html).not.toContain("No inició");
    expect(html).not.toContain("Cancelar");
  });

});
