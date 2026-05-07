import React, { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientTreatmentPage from "@/app/admin/patients/[id]/treatment/page";

const loadPatientDetailMock = vi.hoisted(() => vi.fn());
const loadTreatmentServiceRequestContextMock = vi.hoisted(() => vi.fn());
const loadTreatmentEpisodeHistoryContextMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
  loadTreatmentServiceRequestContext: loadTreatmentServiceRequestContextMock,
  loadTreatmentEpisodeHistoryContext: loadTreatmentEpisodeHistoryContextMock,
}));
vi.mock("@/app/admin/patients/[id]/components/StartEpisodeOfCareForm", () => ({
  StartEpisodeOfCareForm: ({ serviceRequestId }: { serviceRequestId?: string }) =>
    createElement("div", null, `StartEpisodeOfCareForm${serviceRequestId ? `:${serviceRequestId}` : ""}`),
}));

vi.mock("@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm", () => ({
  FinishEpisodeOfCareForm: () => createElement("div", null, "FinishEpisodeOfCareForm"),
}));
vi.mock("@/app/admin/patients/[id]/components/TreatmentClinicalContextForm", () => ({
  TreatmentClinicalContextForm: () => createElement("div", null, "TreatmentClinicalContextForm"),
}));

const basePatient = {
  id: "pat-1",
  firstName: "Ana",
  lastName: "Pérez",
  fullName: "Ana Pérez",
  dni: "30111222",
  birthDate: "1958-04-24",
  operationalStatus: "ready_to_start",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  activeEpisode: null,
  latestEpisode: null,
};

describe("/admin/patients/[id]/treatment page", () => {
  afterEach(() => {
    vi.useRealTimers();
    loadTreatmentServiceRequestContextMock.mockReset();
    loadTreatmentEpisodeHistoryContextMock.mockReset();
  });

  it("shows contextual block when serviceRequestId is valid", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: "sr-1",
      isValid: true,
      state: "valid",
      message: undefined,
      serviceRequest: {
        id: "sr-1",
        patientId: "pat-1",
        status: "accepted",
        requestedAt: "2026-04-10",
        reasonText: "Dolor lumbar",
        reportedDiagnosisText: "Lumbalgia",
        requesterDisplay: "Dr. Soto",
        createdAt: "2026-04-10T00:00:00.000Z",
      },
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ serviceRequestId: "sr-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Inicio de tratamiento desde solicitud aceptada");
    expect(html).toContain("Fecha de solicitud: 10/04/2026");
    expect(html).toContain("Motivo: Dolor lumbar");
    expect(html).toContain("Diagnóstico informado: Lumbalgia");
    expect(html).toContain("Solicitante: Dr. Soto");
    expect(html).toContain("StartEpisodeOfCareForm:sr-1");
  });


  it("does not show start form without serviceRequestId", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: undefined,
      isValid: false,
      state: "none",
      message: undefined,
      serviceRequest: undefined,
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("No hay tratamientos registrados");
    expect(html).toContain("Iniciá un tratamiento desde una solicitud aceptada.");
    expect(html).toContain('href="/admin/patients/pat-1/administrative#service-requests"');
    expect(html).not.toContain("StartEpisodeOfCareForm");
  });
  it("shows warning and keeps legacy start when serviceRequestId is invalid", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: undefined,
      isValid: false,
      state: "invalid",
      message: undefined,
      serviceRequest: undefined,
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ serviceRequestId: "sr-bad" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("No se pudo usar la solicitud indicada para iniciar tratamiento.");
    expect(html).toContain("Iniciá un tratamiento desde una solicitud aceptada.");
    expect(html).not.toContain("StartEpisodeOfCareForm");
  });


  it("shows already-used warning and does not pass serviceRequestId to start form", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: undefined,
      isValid: false,
      state: "already_used",
      message: "Esta solicitud ya fue utilizada para iniciar un tratamiento. Para un nuevo ciclo, registrá una nueva solicitud.",
      serviceRequest: undefined,
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ serviceRequestId: "sr-2" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Esta solicitud ya fue utilizada para iniciar un tratamiento. Para un nuevo ciclo, registrá una nueva solicitud.");
    expect(html).toContain("Iniciá un tratamiento desde una solicitud aceptada.");
    expect(html).not.toContain("StartEpisodeOfCareForm");
  });
  it("keeps active treatment block and no start form when active episode exists", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      ...basePatient,
      operationalStatus: "active_treatment",
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      latestEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
    });
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: "sr-1",
      isValid: true,
      state: "valid",
      message: undefined,
      serviceRequest: {
        id: "sr-1",
        patientId: "pat-1",
        status: "accepted",
        requestedAt: "2026-04-10",
        reasonText: "Dolor lumbar",
        createdAt: "2026-04-10T00:00:00.000Z",
      },
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ serviceRequestId: "sr-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Tratamiento activo");
    expect(html).toContain("TreatmentClinicalContextForm");
    expect(html).toContain("FinishEpisodeOfCareForm");
    expect(html).not.toContain("StartEpisodeOfCareForm");
    expect(html).not.toContain("Registrar visita");
  });

  it("shows closed episodes history and requests link when no active treatment but finished cycles exist", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      ...basePatient,
      operationalStatus: "finished_treatment",
      latestEpisode: {
        id: "epi-2",
        patientId: "pat-1",
        status: "finished",
        startDate: "2026-03-01",
        endDate: "2026-03-20",
      },
    });
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([
      {
        id: "epi-2",
        startDate: "2026-03-01",
        endDate: "2026-03-20",
        closureReason: "treatment_completed",
        closureDetail: "Alta funcional",
        serviceRequestId: "sr-22",
      },
    ]);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: undefined,
      isValid: false,
      state: "none",
      message: undefined,
      serviceRequest: undefined,
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("No hay tratamiento activo");
    expect(html).toContain("Si corresponde continuar la atención, registrá una nueva solicitud para iniciar otro ciclo.");
    expect(html).toContain("Historial de ciclos cerrados");
    expect(html).toContain("Motivo: Tratamiento completado");
    expect(html).toContain("Detalle: Alta funcional");
    expect(html).toContain("Solicitud de origen: sr-22");
    expect(html).toContain("Ver historial de solicitudes");
    expect(html).toContain('href="/admin/patients/pat-1/administrative#service-requests"');
    expect(html).not.toContain("No hay tratamientos registrados");
  });
});
