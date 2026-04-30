import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import AdminPatientDetailPage from "@/app/admin/patients/[id]/page";

const loadPatientDetailMock = vi.hoisted(() => vi.fn());
const loadPatientHubServiceRequestContextMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
  loadPatientHubServiceRequestContext: loadPatientHubServiceRequestContextMock,
}));

function buildPatient(
  overrides: Partial<PatientDetailReadModel> = {},
): PatientDetailReadModel {
  return {
    id: "pat-1",
    firstName: "Ana",
    lastName: "Pérez",
    fullName: "Ana Pérez",
    operationalStatus: "preliminary",
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
    ...overrides,
  };
}

function mockNoServiceRequestContext() {
  loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({
    hasServiceRequests: false,
    hasInReview: false,
    pendingAcceptedServiceRequestId: undefined,
    latestClosedRequestStatus: undefined,
    latestClosedRequestReason: undefined,
  });
}

describe("/admin/patients/[id] page", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the contacto section with patient contact, address and main contact in order", async () => {
    mockNoServiceRequestContext();
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        phone: "+542995550101",
        address: "Belgrano 123",
        mainContact: {
          name: "Carlos Pérez",
          relationship: "caregiver",
          phone: "+542995550102",
        },
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Visitas");
    expect(html).toContain("Gestión Administrativa");
    expect(html).toContain("Siguiente paso sugerido: Registrá la primera solicitud de atención.");

    const patientContactIndex = html.indexOf("Contacto del paciente");
    const addressIndex = html.indexOf("Dirección");
    const mainContactIndex = html.indexOf("Contacto principal");

    expect(patientContactIndex).toBeGreaterThan(-1);
    expect(addressIndex).toBeGreaterThan(patientContactIndex);
    expect(mainContactIndex).toBeGreaterThan(addressIndex);
  });

  it("renders treatment summary with active episode start date", async () => {
    mockNoServiceRequestContext();
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        operationalStatus: "active_treatment",
        activeEpisode: {
          id: "ep-1",
          patientId: "pat-1",
          status: "active",
          startDate: "2026-04-17",
        },
      }),
    );

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Inicio: 17/04/2026");
    expect(html).toContain("Registrar visita");
    expect(html).toContain("Siguiente paso sugerido: Registrá visitas desde Gestión Clínica.");
  });

  it("shows next-step suggestion for in_review requests", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({ hasServiceRequests: true, hasInReview: true, pendingAcceptedServiceRequestId: undefined, latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({ operationalStatus: "ready_to_start" }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Siguiente paso sugerido: Continuá la resolución administrativa de la solicitud.");
  });

  it("shows next-step suggestion for accepted pending treatment", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({ hasServiceRequests: true, hasInReview: false, pendingAcceptedServiceRequestId: "sr-1", latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({ operationalStatus: "ready_to_start" }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Siguiente paso sugerido: Iniciá el tratamiento desde la solicitud aceptada.");
  });

  it("shows next-step suggestion for finished treatment without useful service request", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({ hasServiceRequests: true, hasInReview: false, pendingAcceptedServiceRequestId: undefined, latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({
      operationalStatus: "finished_treatment",
      latestEpisode: { id: "ep-1", patientId: "pat-1", status: "finished", startDate: "2026-01-01", endDate: "2026-02-01" },
    }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Siguiente paso sugerido: Si requiere un nuevo ciclo, registrá una nueva solicitud de atención.");
  });

  it("renders direct CTA to create service request in administrative", async () => {
    mockNoServiceRequestContext();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient());

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Crear solicitud de atención");
    expect(html).toContain('href="/admin/patients/pat-1/administrative?newServiceRequest=1#service-requests"');
  });

  it("renders not found state when patient does not exist", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(null);

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "missing-id" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Paciente no encontrado");
    expect(html).toContain("No se encontró el paciente solicitado.");
  });


  it("renders compact operational reasons for latest finished treatment and latest closed request", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({
      hasServiceRequests: true,
      hasInReview: false,
      pendingAcceptedServiceRequestId: undefined,
      latestClosedRequestStatus: "closed_without_treatment",
      latestClosedRequestReason: "Motivos económicos",
    });
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({
      operationalStatus: "finished_treatment",
      latestEpisode: {
        id: "ep-1",
        patientId: "pat-1",
        status: "finished",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        closureReason: "treatment_completed",
      },
    }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Último tratamiento: finalizado — Motivo: Tratamiento completado");
    expect(html).toContain("Última solicitud: No inició — Motivo: Motivos económicos");
  });

});
