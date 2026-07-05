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
    expect(html).toContain("Tratamiento");
    expect(html).toContain("Próximo paso recomendado");
    expect(html).toContain("Estado actual");
    expect(html).toContain("Orientación breve del caso. El detalle está en Gestión clínica y Tratamiento.");
    expect(html).toContain("Última visita:</span> No disponible");
    expect(html).toContain("Navegación secundaria");
    expect(html).not.toContain("Diagnóstico médico:");
    expect(html).not.toContain("Impresión kinésica:");

    const summaryIndex = html.indexOf("Estado actual");
    const contactIndex = html.indexOf("Contacto operativo");
    const suggestionIndex = html.indexOf("Próximo paso recomendado");
    const actionsIndex = html.indexOf("Navegación secundaria");

    expect(contactIndex).toBeGreaterThan(summaryIndex);
    expect(actionsIndex).toBeGreaterThan(-1);
    expect(suggestionIndex).toBeGreaterThan(-1);

    const patientContactIndex = html.indexOf("Teléfono del paciente");
    const mainContactIndex = html.indexOf("Contacto principal");
    const addressIndex = html.indexOf("Dirección");

    expect(patientContactIndex).toBeGreaterThan(-1);
    expect(mainContactIndex).toBeGreaterThan(patientContactIndex);
    expect(addressIndex).toBeGreaterThan(mainContactIndex);
  });

  it("renders compact diagnosis rows in clinical summary without edit controls", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary({
      medicalReferenceDiagnosisText: "Artrosis de rodilla",
      kinesiologicDiagnosisText: "Déficit de control femoropatelar",
      metrics: [{ label: "Dolor", value: "4/10" }],
    });
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient());

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Señal clínica breve:</span> Dolor: 4/10");
    expect(html).not.toContain("Artrosis de rodilla");
    expect(html).not.toContain("Déficit de control femoropatelar");
    expect(html).not.toContain("Editar diagnóstico médico");
    expect(html).not.toContain("Agregar diagnóstico médico");
    expect(html).not.toContain("<form");
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
    expect(html).toContain("El tratamiento está activo. Registrá la próxima visita desde Gestión clínica.");
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
    expect(html).toContain("Enviar WhatsApp al contacto principal");
    expect(html).not.toContain("Enviar WhatsApp al paciente");
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
    expect(html).toContain("Enviar WhatsApp al paciente");
    expect(html).toContain("https://wa.me/542995550101");
    expect(html).toContain("Teléfono del contacto principal:</span> +54 299 555-0202");
    expect(html).toContain("Enviar WhatsApp al contacto principal");
    expect(html).toContain("https://wa.me/542995550202");
  });

  it("shows next-step suggestion for in_review requests", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({
 hasServiceRequests: true, hasInReview: true, pendingAcceptedServiceRequestId: undefined, latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({ operationalStatus: "ready_to_start" }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Preparar inicio");
    expect(html).not.toContain("Listo para iniciar");
    expect(html).toContain("Solicitud pendiente de revisión");
    expect(html).toContain("Hay una solicitud de atención cargada. Revisala para aceptarla, cancelarla o cerrarla sin iniciar tratamiento.");
    expect(html).toContain("Revisar solicitud");
    expect(html).toContain("href=\"/admin/patients/pat-1/administrative#service-requests\"");
    expect(html).not.toContain("Registrar solicitud");
  });

  it("shows post-intake success guidance when requestCreated=1 and the request is still in review", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({
      hasServiceRequests: true,
      hasInReview: true,
      pendingAcceptedServiceRequestId: undefined,
      latestClosedRequestStatus: undefined,
      latestClosedRequestReason: undefined,
    });
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({
      operationalStatus: "ready_to_start",
      address: "Belgrano 123",
      phone: "+54 299 555 0101",
    }));

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ requestCreated: "1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Solicitud registrada");
    expect(html).toContain("La consulta inicial quedó cargada. Revisá la solicitud para decidir si avanza, se cancela o se cierra sin iniciar tratamiento.");
    expect(html).toContain("Revisar solicitud");
    expect(html).toContain("Completar datos administrativos");
    expect(html).toContain("href=\"/admin/patients/pat-1/administrative#service-requests\"");
    expect(html).toContain("href=\"/admin/patients/pat-1/administrative\"");
    expect(html).not.toContain("Solicitud pendiente de revisión");
    expect(html).not.toContain("Iniciar tratamiento");
    expect(html).not.toContain("Registrar visita");
  });

  it("shows next-step suggestion for accepted pending treatment", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({ hasServiceRequests: true, hasInReview: false, pendingAcceptedServiceRequestId: "sr-1", latestClosedRequestStatus: undefined, latestClosedRequestReason: undefined });
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({ operationalStatus: "ready_to_start" }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Solicitud aceptada pendiente");
    expect(html).toContain("La solicitud ya fue aceptada. Falta iniciar el tratamiento para habilitar el registro de visitas.");
    expect(html).toContain("Iniciar tratamiento");
    expect(html).toContain("href=\"/admin/patients/pat-1/treatment?serviceRequestId=sr-1\"");
    expect(html).not.toContain(">Tratamiento</a>");
    expect(html).not.toContain("Registrar solicitud");
  });

  it("does not show post-intake success guidance when treatment is active even if requestCreated=1 is present", async () => {
    loadPatientHubServiceRequestContextMock.mockResolvedValueOnce({
      hasServiceRequests: true,
      hasInReview: true,
      pendingAcceptedServiceRequestId: undefined,
      latestClosedRequestStatus: undefined,
      latestClosedRequestReason: undefined,
    });
    mockClinicalRecentSummary({
      treatmentStatusLabel: "Tratamiento activo",
    });
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

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ requestCreated: "1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Tratamiento activo");
    expect(html).toContain("Registrar visita");
    expect(html).not.toContain("Solicitud registrada");
    expect(html).not.toContain("Completar datos administrativos");
  });

  it("shows register-request guidance for patient without service requests or treatment", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({
      operationalStatus: "preliminary",
    }));

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Próximo paso recomendado");
    expect(html).toContain("Registrá la solicitud de atención para dejar asentado quién consulta, el motivo del pedido y la fecha de la consulta inicial.");
    expect(html).toContain("Registrar solicitud");
    expect(html).toContain("href=\"/admin/patients/pat-1/administrative?newServiceRequest=1#service-requests\"");
    expect(html).not.toContain("Crear solicitud de atención");
  });

  it("does not show post-intake success guidance when requestCreated=1 is present but there is no request", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient({
      operationalStatus: "preliminary",
    }));

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ requestCreated: "1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Próximo paso recomendado");
    expect(html).toContain("Registrar solicitud");
    expect(html).not.toContain("Solicitud registrada");
    expect(html).not.toContain("Completar datos administrativos");
    expect(html).not.toContain("Iniciar tratamiento");
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

    expect(html).toContain("Si corresponde un nuevo ciclo, registrá o resolvé una nueva solicitud de atención.");
  });

  it("avoids duplicating the create-request CTA in secondary navigation when it is already primary", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient());

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Registrar solicitud");
    expect(html).toContain('href="/admin/patients/pat-1/administrative?newServiceRequest=1#service-requests"');
    expect(html).not.toContain("Crear solicitud de atención");
  });

  it("does not render Registrar visita for preliminary", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(buildPatient());

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain('href="/admin/patients/pat-1/encounters/new"');
  });

  it("does not show register-request guidance when treatment is active", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary({
      treatmentStatusLabel: "Tratamiento activo",
    });
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

    expect(html).not.toContain("Registrá la solicitud de atención para dejar asentado quién consulta, el motivo del pedido y la fecha de la consulta inicial.");
    expect(html).not.toContain("href=\"/admin/patients/pat-1/administrative?newServiceRequest=1#service-requests\"");
  });

  it("does not render Registrar visita for ready_to_start", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary();
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        operationalStatus: "ready_to_start",
        address: "Belgrano 123",
        phone: "+54 299 555 0101",
      }),
    );

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain('href="/admin/patients/pat-1/encounters/new"');
  });

  it("does not render Registrar visita for finished_treatment", async () => {
    mockNoServiceRequestContext();
    mockClinicalRecentSummary({
      treatmentStatusLabel: "Tratamiento finalizado",
    });
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        operationalStatus: "finished_treatment",
        latestEpisode: {
          id: "ep-1",
          patientId: "pat-1",
          status: "finished",
          startDate: "2026-01-01",
          endDate: "2026-02-01",
        },
      }),
    );

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain('href="/admin/patients/pat-1/encounters/new"');
  });

  it("renders not found state when patient does not exist", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(null);

    const element = await AdminPatientDetailPage({ params: Promise.resolve({ id: "missing-id" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Paciente no encontrado");
    expect(html).toContain("No se encontró el paciente solicitado.");
  });
});
