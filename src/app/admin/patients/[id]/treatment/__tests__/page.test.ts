import React, { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientTreatmentPage from "@/app/admin/patients/[id]/treatment/page";

const loadPatientDetailMock = vi.hoisted(() => vi.fn());
const loadTreatmentServiceRequestContextMock = vi.hoisted(() => vi.fn());
const loadTreatmentEpisodeHistoryContextMock = vi.hoisted(() => vi.fn());
const loadActiveTreatmentEncountersCountMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadActiveTreatmentEncountersCount: loadActiveTreatmentEncountersCountMock,
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
    loadActiveTreatmentEncountersCountMock.mockReset();
    loadTreatmentServiceRequestContextMock.mockReset();
    loadTreatmentEpisodeHistoryContextMock.mockReset();
  });

  it("shows contextual block when serviceRequestId is valid", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
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

    expect(html).toContain("Solicitud aceptada disponible");
    expect(html).toContain("Fecha: 10/04/2026");
    expect(html).toContain("Motivo: Dolor lumbar");
    expect(html).toContain("Diagnóstico informado: Lumbalgia");
    expect(html).toContain("Solicitante: Dr. Soto");
    expect(html).toContain(">Paciente</p>");
    expect(html).toContain("Ana Pérez");
    expect(html).toContain("DNI: 30.111.222");
    expect(html).toContain("Edad: 68 años");
    expect(html).toContain("Ver gestión administrativa");
    expect(html).toContain("Ver solicitudes");
    expect(html).toContain("StartEpisodeOfCareForm:sr-1");
  });


  it("does not show start form without serviceRequestId", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
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

    expect(html).toContain(">Paciente</p>");
    expect(html).toContain(">Tratamiento</p>");
    expect(html).toContain("Sin tratamiento activo");
    expect(html).toContain("Para registrar visitas primero necesitás iniciar un tratamiento desde una solicitud de atención aceptada.");
    expect(html).toContain("Ver solicitudes");
    expect(html).toContain('href="/admin/patients/pat-1/administrative#service-requests"');
    expect(html).not.toContain("StartEpisodeOfCareForm");
  });
  it("shows warning and keeps legacy start when serviceRequestId is invalid", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
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
    expect(html).toContain("Para registrar visitas primero necesitás iniciar un tratamiento desde una solicitud de atención aceptada.");
    expect(html).not.toContain("StartEpisodeOfCareForm");
  });


  it("shows already-used warning and does not pass serviceRequestId to start form", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
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
    expect(html).toContain("Para registrar visitas primero necesitás iniciar un tratamiento desde una solicitud de atención aceptada.");
    expect(html).not.toContain("StartEpisodeOfCareForm");
  });
  it("keeps one primary CTA to clinical management and no duplicate operational destination when active episode exists", async () => {
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
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(6);
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

    expect(html).toContain(">Paciente</p>");
    expect(html).toContain("En curso");
    expect(html).toContain(">Paciente</p>");
    expect(html).toContain(">Tratamiento</p>");
    expect(html).toContain("Inicio: 01/04/2026");
    expect(html).toContain("6 sesiones registradas");
    expect(html).toContain("TreatmentClinicalContextForm");
    expect(html).toContain("Cerrar tratamiento");
    expect(html).toContain("Acción de cierre formal del ciclo. Usala cuando el tratamiento ya terminó.");
    expect(html).toContain("Abrir formulario de cierre");
    expect(html).toContain("FinishEpisodeOfCareForm");
    expect(html.indexOf(">Tratamiento</p>")).toBeLessThan(html.indexOf("TreatmentClinicalContextForm"));
    expect(html.indexOf("TreatmentClinicalContextForm")).toBeLessThan(html.indexOf("Atajos útiles"));
    expect(html.indexOf("Atajos útiles")).toBeLessThan(html.indexOf("Cerrar tratamiento"));
    expect(html).toContain("Ir a gestión clínica");
    expect(html).toContain("Completá el contexto clínico acá y registrá cada visita desde Gestión clínica.");
    expect(html.match(/href=\"\/admin\/patients\/pat-1\/encounters\"/g)?.length).toBe(1);
    expect(html).not.toContain("Ver / registrar visitas del ciclo");
    expect(html).not.toContain("StartEpisodeOfCareForm");
    expect(html).not.toContain("Registrar visita");
  });

  it("explains that visits require an active treatment when there is no active episode but closed history exists", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      ...basePatient,
      operationalStatus: "finished_treatment",
      latestEpisode: {
        id: "epi-closed",
        patientId: "pat-1",
        status: "finished",
        startDate: "2026-02-01",
        endDate: "2026-03-01",
      },
    });
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([
      {
        id: "epi-closed",
        startDate: "2026-02-01",
        endDate: "2026-03-01",
        closureReason: "treatment_completed",
      },
    ]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
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

    expect(html).toContain(">Paciente</p>");
    expect(html).toContain(">Tratamiento</p>");
    expect(html).toContain("Sin tratamiento activo");
    expect(html).toContain("Para registrar visitas primero necesitás iniciar un tratamiento desde una solicitud de atención aceptada.");
    expect(html).toContain("Último tratamiento finalizado: 01/03/2026.");
    expect(html).toContain('href="/admin/patients/pat-1/administrative#service-requests"');
  });

  it("renders active treatment as primary state and closed cycles only as history", async () => {
    const closedEpisodeOld = {
      id: "episode-closed-old",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      closureReason: "treatment_completed",
      closureDetail: "Alta funcional previa",
      serviceRequestId: "sr-closed-old",
    };
    const closedEpisodeRecent = {
      id: "episode-closed-recent",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      closureReason: "clinical_discharge",
      closureDetail: "Alta clínica previa",
      serviceRequestId: "sr-closed-recent",
    };
    const activeEpisode = {
      id: "episode-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-05-01",
    };

    loadPatientDetailMock.mockResolvedValueOnce({
      ...basePatient,
      operationalStatus: "active_treatment",
      activeEpisode,
      latestEpisode: activeEpisode,
    });
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([
      closedEpisodeRecent,
      closedEpisodeOld,
    ]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(2);
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

    expect(html).toContain(">Tratamiento</p>");
    expect(html).toContain("En curso");
    expect(html).toContain("2 sesiones registradas");
    expect(html).toContain("Completá el contexto clínico acá y registrá cada visita desde Gestión clínica.");
    expect(html).toContain("TreatmentClinicalContextForm");
    expect(html).toContain("Historial de ciclos cerrados");
    expect(html).toContain("Bloque secundario de antecedentes. No reemplaza el estado actual del tratamiento.");
    expect(html.match(/Ciclo finalizado/g)?.length).toBe(2);
    expect(html.match(/Finalizado/g)?.length).toBe(2);
    expect(html).toContain("01/03/2026");
    expect(html).toContain("01/01/2026");
    expect(html).toContain("31/03/2026");
    expect(html).toContain("31/01/2026");
    expect(html).toContain("Alta clínica");
    expect(html).toContain("Alta funcional previa");
    expect(html).toContain("sr-closed-recent");
    expect(html).toContain("sr-closed-old");
    expect(html).not.toContain("Resumen del tratamiento finalizado");
    expect(html).not.toContain("No hay tratamiento activo");
    expect(html).not.toContain("StartEpisodeOfCareForm");
    expect(html.indexOf(">Tratamiento</p>")).toBeLessThan(html.indexOf("TreatmentClinicalContextForm"));
    expect(html.indexOf("En curso")).toBeLessThan(html.indexOf("Historial de ciclos cerrados"));
  });

  it("renders closed-cycle fallbacks without making history look actionable", async () => {
    const activeEpisode = {
      id: "episode-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-05-01",
    };

    loadPatientDetailMock.mockResolvedValueOnce({
      ...basePatient,
      operationalStatus: "active_treatment",
      activeEpisode,
      latestEpisode: activeEpisode,
    });
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([
      {
        id: "episode-closed-without-detail",
        startDate: "2026-02-01",
        endDate: "2026-02-20",
      },
    ]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
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

    expect(html).toContain("En curso");
    expect(html).toContain("Historial de ciclos cerrados");
    expect(html).toContain("Sin motivo registrado");
    expect(html).toContain("Sin detalle adicional");
    expect(html).toContain("Sin solicitud vinculada");
    expect(html).not.toContain("Último tratamiento finalizado");
  });

  it("displays treatment start from episode independently from service request date", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      ...basePatient,
      operationalStatus: "active_treatment",
      activeEpisode: {
        id: "epi-9",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-05-03",
      },
      latestEpisode: {
        id: "epi-9",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-05-03",
      },
    });
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(1);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: "sr-1",
      isValid: true,
      state: "valid",
      message: undefined,
      serviceRequest: {
        id: "sr-1",
        patientId: "pat-1",
        status: "accepted",
        requestedAt: "2026-05-01",
        reasonText: "Dolor lumbar",
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ serviceRequestId: "sr-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Fecha: 01/05/2026");
    expect(html).toContain("Inicio: 03/05/2026");
  });

  it("shows started-treatment status feedback when redirected from administrative flow", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(basePatient);
    loadTreatmentEpisodeHistoryContextMock.mockResolvedValueOnce([]);
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
    loadTreatmentServiceRequestContextMock.mockResolvedValueOnce({
      serviceRequestId: undefined,
      isValid: false,
      state: "none",
      message: undefined,
      serviceRequest: undefined,
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ status: "treatment-started" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Tratamiento iniciado. Revisá o completá el contexto general del tratamiento.");
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
    loadActiveTreatmentEncountersCountMock.mockResolvedValueOnce(0);
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

    expect(html).toContain("Sin tratamiento activo");
    expect(html).toContain("Para registrar visitas primero necesitás iniciar un tratamiento desde una solicitud de atención aceptada.");
    expect(html).toContain("Último tratamiento finalizado");
    expect(html).toContain("Historial de ciclos cerrados");
    expect(html).toContain("Bloque secundario de antecedentes. No reemplaza el estado actual del tratamiento.");
    expect(html).toContain("Motivo: Tratamiento completado");
    expect(html).toContain("Gestión administrativa para nuevo ciclo");
    expect(html).toContain("Ciclo finalizado");
    expect(html).toContain("Finalizado");
    expect(html).toContain("Tratamiento completado");
    expect(html).toContain("Alta funcional");
    expect(html).toContain("Ver solicitudes");
    expect(html).toContain('href="/admin/patients/pat-1/administrative#service-requests"');
    expect(html).not.toContain("No hay tratamientos registrados");
  });
});
