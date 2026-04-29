import React, { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientAdministrativePage from "@/app/admin/patients/[id]/administrative/page";

const loadPatientAdministrativeContextMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: vi.fn(),
  loadPatientAdministrativeContext: loadPatientAdministrativeContextMock,
}));

describe("/admin/patients/[id]/administrative page", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders reading-first admin summary, service request section and explicit edit action", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00Z"));

    loadPatientAdministrativeContextMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        firstName: "Ana",
        lastName: "Pérez",
        dni: "30111222",
        birthDate: "1958-04-24",
        operationalStatus: "active_treatment",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      serviceRequests: [
        {
          id: "sr-1",
          patientId: "pat-1",
          requestedAt: "2026-04-21",
          reasonText: "Dolor lumbar",
          reportedDiagnosisText: "Lumbalgia",
          requesterDisplay: "Dra. Pérez",
          status: "in_review",
        },
        {
          id: "sr-2",
          patientId: "pat-1",
          requestedAt: "2026-04-10",
          reasonText: "Control funcional",
          status: "closed_without_treatment",
        },
      ],
      latestServiceRequest: {
        id: "sr-1",
        patientId: "pat-1",
        requestedAt: "2026-04-21",
        reasonText: "Dolor lumbar",
        reportedDiagnosisText: "Lumbalgia",
        requesterDisplay: "Dra. Pérez",
        status: "in_review",
      },
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("← Volver al paciente");
    expect(html).toContain("href=\"/admin/patients/pat-1\"");
    expect(html).toContain("Ana Pérez");
    expect(html).toContain("Resumen administrativo");
    expect(html).toContain("DNI: 30.111.222");
    expect(html).toContain("Edad: 68 años");
    expect(html).toContain("En tratamiento");
    expect(html).toContain("Editar datos");
    expect(html).toContain("Datos administrativos y de contacto");

    expect(html).toContain("Solicitudes de atención");
    expect(html).toContain("Registro administrativo de demandas o consultas");
    expect(html).toContain("Motivo de consulta");
    expect(html).toContain("Dolor lumbar");
    expect(html).toContain("Diagnóstico informado");
    expect(html).toContain("Lumbalgia");
    expect(html).toContain("Solicitante");
    expect(html).toContain("Dra. Pérez");
    expect(html).toContain("En evaluación");
    expect(html).toContain("No inició");

    expect(html).toContain("Nueva solicitud");
    expect(html).not.toContain("<form");
    expect(html).toContain("Aceptar");
    expect(html).toContain("No inició");
    expect(html).toContain("Cancelar");
    expect(html).not.toContain("Registrar visita");
    expect(html).not.toContain("Iniciar tratamiento");
  });

  it("renders empty state for service requests when there are none", async () => {
    loadPatientAdministrativeContextMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        firstName: "Ana",
        lastName: "Pérez",
        dni: "30111222",
        operationalStatus: "ready_to_start",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      serviceRequests: [],
      latestServiceRequest: null,
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("DNI: 30.111.222");
    expect(html).not.toContain("Edad:");
    expect(html).toContain("Solicitudes de atención");
    expect(html).toContain("Registrá la primera solicitud para dejar asentado el motivo de consulta y avanzar con la evaluación.");
  });

  it("keeps back link before page title", async () => {
    loadPatientAdministrativeContextMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        firstName: "Ana",
        lastName: "Pérez",
        operationalStatus: "preliminary",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      serviceRequests: [],
      latestServiceRequest: null,
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    const backLinkIndex = html.indexOf("← Volver al paciente");
    const titleIndex = html.indexOf("Administración del paciente");

    expect(backLinkIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeGreaterThan(backLinkIndex);
  });


  it("opens create form when newServiceRequest=1 is provided", async () => {
    loadPatientAdministrativeContextMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        firstName: "Ana",
        lastName: "Pérez",
        operationalStatus: "ready_to_start",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      serviceRequests: [],
      latestServiceRequest: null,
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ newServiceRequest: "1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Registrar solicitud");
    expect(html).toContain("Motivo de consulta *");
    expect(html).not.toContain("Nueva solicitud");
  });

  it("keeps create form closed when query param is absent", async () => {
    loadPatientAdministrativeContextMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        firstName: "Ana",
        lastName: "Pérez",
        operationalStatus: "ready_to_start",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      serviceRequests: [],
      latestServiceRequest: null,
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Nueva solicitud");
    expect(html).not.toContain("Registrar solicitud");
  });

  it("keeps not-found fallback", async () => {
    loadPatientAdministrativeContextMock.mockResolvedValueOnce({
      patient: null,
      serviceRequests: [],
      latestServiceRequest: null,
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "missing-id" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("← Volver a pacientes");
    expect(html).toContain("No se encontró el paciente solicitado.");
    expect(html).not.toContain("Solicitudes de atención");
  });
});
