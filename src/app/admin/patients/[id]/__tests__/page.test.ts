import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import AdminPatientDetailPage from "@/app/admin/patients/[id]/page";

const loadPatientDetailMock = vi.hoisted(() => vi.fn());
const loadPatientHubServiceRequestContextMock = vi.hoisted(() => vi.fn());
const loadPatientClinicalRecentSummaryMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
  loadPatientHubServiceRequestContext: loadPatientHubServiceRequestContextMock,
  loadPatientClinicalRecentSummary: loadPatientClinicalRecentSummaryMock,
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

function mockClinicalRecentSummary(overrides = {}) {
  loadPatientClinicalRecentSummaryMock.mockResolvedValueOnce({
    treatmentStatusLabel: "Sin tratamiento activo",
    latestEncounterLabel: "No disponible",
    encountersCount: 0,
    metrics: [],
    metricsEmptyLabel: "Sin registros funcionales",
    ctaLabel: "Ver gestión clínica",
    ...overrides,
  });
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
    mockClinicalRecentSummary();
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

    expect(html).toContain("Ana Pérez");
    expect(html).toContain("DNI: No informado");
    expect(html).toContain("Gestión clínica");
    expect(html).toContain("Gestión administrativa");
    expect(html).toContain("Próxima acción recomendada");
    expect(html).toContain("Resumen clínico reciente");
    expect(html).toContain("Síntesis rápida. El detalle está en Gestión clínica.");
    expect(html).toContain("Última visita:</span> No disponible");
    expect(html).not.toContain("href=\"/admin/patients/pat-1/encounters\">Ver gestión clínica");

    const suggestionIndex = html.indexOf("Próxima acción recomendada");
    const summaryIndex = html.indexOf("Resumen clínico reciente");
    expect(summaryIndex).toBeGreaterThan(suggestionIndex);

    const patientContactIndex = html.indexOf("Paciente");
    const addressIndex = html.indexOf("Dirección");
    const mainContactIndex = html.indexOf("Contacto principal");

    expect(patientContactIndex).toBeGreaterThan(-1);
    expect(addressIndex).toBeGreaterThan(patientContactIndex);
    expect(mainContactIndex).toBeGreaterThan(addressIndex);
  });

  it("renders treatment summary with active episode start date", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        operationalStatus: "active_treatment",
        activeEpisode: {
          id: "ep-1",
          patientId: "pat-1",
          status: "active",
          startDate: "2026-04-17",
        },
        birthDate: "1990-01-01",
      }),
    );

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Inicio: 17/04/2026");
    expect(html).toContain("Edad:");
    expect(html).toContain("Registrar visita");
    expect(html).toContain("DNI: No informado");
    expect(html).toContain("Registrá visitas desde Gestión clínica.");
  });

  it("uses main contact actions in hub when patient phone is missing", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        phone: undefined,
        mainContact: {
          name: "Adolfo Javier",
          relationship: undefined,
          phone: "+54 299 545 6578",
        },
      }),
    );

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);
    expect(html).toContain("Teléfono del paciente:</span> No informado");
    expect(html).toContain("WhatsApp contacto principal");
    expect(html).not.toContain("WhatsApp paciente");
  });

  it("prioritizes patient channel in hub when both patient and main contact phones exist", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        phone: "+54 299 555 0101",
        mainContact: {
          name: "Carlos Pérez",
          relationship: "caregiver",
          phone: "+54 299 555 0202",
        },
      }),
    );

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Teléfono del paciente:</span> +54 299 555-0101");
    expect(html).toContain("WhatsApp paciente");
    expect(html).toContain("https://wa.me/542995550101");
    expect(html).toContain("Teléfono del contacto principal:</span> +54 299 555-0202");
    expect(html).toContain("https://wa.me/542995550202");
  });

  it("shows next-step suggestion for in_review requests", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({
 hasServiceRequests: true, hasInReview: true, pendingAcceptedServiceRequestId: undefined, latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({ operationalStatus: "ready_to_start" }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Continuá la resolución administrativa de la solicitud.");
  });

  it("shows next-step suggestion for accepted pending treatment", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({ hasServiceRequests: true, hasInReview: false, pendingAcceptedServiceRequestId: "sr-1", latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({ operationalStatus: "ready_to_start" }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Iniciá el tratamiento desde la solicitud aceptada.");
  });

  it("shows next-step suggestion for finished treatment without useful service request", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({ hasServiceRequests: true, hasInReview: false, pendingAcceptedServiceRequestId: undefined, latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    mockClinicalRecentSummary({ treatmentStatusLabel: "Tratamiento finalizado", latestEncounterLabel: "2026-02-01T12:00:00.000Z", encountersCount: 6 });
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({
      operationalStatus: "finished_treatment",
      latestEpisode: { id: "ep-1", patientId: "pat-1", status: "finished", startDate: "2026-01-01", endDate: "2026-02-01" },
    }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Si requiere un nuevo ciclo, registrá una nueva solicitud de atención.");
  });

  it("renders direct CTA to create service request in administrative", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
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
