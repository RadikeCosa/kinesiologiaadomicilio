import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientEncountersPage from "@/app/admin/patients/[id]/encounters/page";

const loadPatientEncountersPageDataMock = vi.hoisted(() => vi.fn());
const loadPatientDetailMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/encounters/data", () => ({
  loadPatientEncountersPageData: loadPatientEncountersPageDataMock,
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
}));

vi.mock("@/app/admin/patients/[id]/encounters/components/EncountersList", () => ({
  EncountersList: () => createElement("div", null, "EncountersList"),
}));

vi.mock("@/app/admin/patients/[id]/encounters/components/FunctionalTrendSummary", () => ({
  FunctionalTrendSummary: ({ trend }: { trend: unknown[] }) => createElement("div", null, trend.length > 0 ? "Tendencia funcional" : ""),
}));


vi.mock("@/app/admin/patients/[id]/encounters/components/SuccessStatusMessage", () => ({
  SuccessStatusMessage: ({ message }: { message: string }) => createElement("p", null, message),
}));
describe("/admin/patients/[id]/encounters page", () => {
  it("shows success banner for known status params and hides unknown ones", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValue({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        operationalStatus: "active_treatment",
      },
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      mostRecentEpisode: null,
      encounters: [],
      functionalTrend: [{ code: "pain_nrs_0_10", label: "Dolor", latestValue: 4, latestDate: "2026-04-17", unit: "/10" }],
      clinicalContext: {
        hasAnyContent: true,
        medicalReferenceDiagnosisText: "Lumbalgia mecánica",
        initialFunctionalStatus: "Marcha con dolor",
        therapeuticGoals: "Reducir dolor y recuperar tolerancia a marcha diaria.",
        frameworkPlan: "Plan general",
        kinesiologicDiagnosisText: "Compromiso funcional lumbar",
      },
      encounterStats: {
        totalCount: 0,
        treatmentCount: 0,
        lastStartedAt: null,
        averageDurationMinutes: null,
        totalDurationMinutes: null,
        durationEligibleCount: 0,
        durationExcludedCount: 0,
        isDurationPartial: false,
        daysToFirstVisitFromEpisodeStart: null,
        isFirstVisitBeforeEpisodeStart: false,
        averageDaysBetweenEpisodeVisits: null,
        frequencyEligibleVisitCount: 0,
        frequencyIntervalCount: 0,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });

    const treatmentStartedElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ status: "treatment-started" }),
    });
    const treatmentStartedHtml = renderToStaticMarkup(treatmentStartedElement);
    expect(treatmentStartedHtml).toContain("Tratamiento iniciado. Ya podés registrar visitas.");

    const encounterCreatedElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ status: "encounter-created" }),
    });
    const encounterCreatedHtml = renderToStaticMarkup(encounterCreatedElement);
    expect(encounterCreatedHtml).toContain("Visita registrada.");

    const unknownStatusElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ status: "unknown-status" }),
    });
    const unknownStatusHtml = renderToStaticMarkup(unknownStatusElement);
    expect(unknownStatusHtml).not.toContain("Tratamiento iniciado. Ya podés registrar visitas.");
    expect(unknownStatusHtml).not.toContain("Visita registrada.");

    const noStatusElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({}),
    });
    const noStatusHtml = renderToStaticMarkup(noStatusElement);
    expect(noStatusHtml).not.toContain("Tratamiento iniciado. Ya podés registrar visitas.");
    expect(noStatusHtml).not.toContain("Visita registrada.");
  });

  it("uses standardized back labels, renders primary encounter CTA once and secondary treatment navigation", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce(null);

    const notFoundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "missing" }),
    });
    const notFoundHtml = renderToStaticMarkup(notFoundElement);

    expect(notFoundHtml).toContain("← Volver a pacientes");
    expect(notFoundHtml).toContain("href=\"/admin/patients\"");

    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        dni: "30111222",
        operationalStatus: "active_treatment",
      },
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      mostRecentEpisode: null,
      encounters: [],
      functionalTrend: [{ code: "pain_nrs_0_10", label: "Dolor", latestValue: 4, latestDate: "2026-04-17", unit: "/10" }],
      encounterStats: {
        totalCount: 0,
        treatmentCount: 0,
        lastStartedAt: null,
        averageDurationMinutes: null,
        totalDurationMinutes: null,
        durationEligibleCount: 0,
        durationExcludedCount: 0,
        isDurationPartial: false,
        daysToFirstVisitFromEpisodeStart: null,
        isFirstVisitBeforeEpisodeStart: false,
        averageDaysBetweenEpisodeVisits: null,
        frequencyEligibleVisitCount: 0,
        frequencyIntervalCount: 0,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });

    const foundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const foundHtml = renderToStaticMarkup(foundElement);

    expect(foundHtml).toContain("← Volver al paciente");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1\"");
    expect(foundHtml).toContain("Gestión clínica");
    expect(foundHtml).toContain("Ana Pérez");
    expect(foundHtml).toContain("Registrá y consultá las visitas e informes del tratamiento.");
    expect(foundHtml).toContain("DNI: 30.111.222");
    expect(foundHtml).toContain("Tratamiento activo");
    expect(foundHtml).toContain("Inicio: 01/04/2026");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(foundHtml).toContain("Registrar visita");
    expect(foundHtml.match(/href=\"\/admin\/patients\/pat-1\/encounters\/new\"/g)?.length).toBe(1);
    expect(foundHtml).not.toContain("Gestionar tratamiento");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(foundHtml).toContain("<summary");
    expect(foundHtml).toContain("Seguimiento rápido del ciclo");
    expect(foundHtml).toContain("Lectura rápida del tratamiento actual");
    expect(foundHtml).toContain("0 visitas del tratamiento");
    expect(foundHtml).toContain("Última visita: sin visitas");
    expect(foundHtml).toContain("Con tendencia funcional");
    expect(foundHtml).toContain("Falta contexto");
    expect(foundHtml).toContain("Resumen del ciclo");
    expect(foundHtml).toContain("Contexto clínico del ciclo");
    expect(foundHtml).toContain("Ver/editar en Tratamiento");
    expect(foundHtml).toContain("Ver detalle longitudinal");
    expect(foundHtml).toContain("Tendencia funcional");
    expect(foundHtml).toContain("EncountersList");
    expect(foundHtml).toMatch(/<details[^>]*aria-label="Seguimiento rápido del ciclo"[^>]*open=""/);
    expect(foundHtml.indexOf("Seguimiento rápido del ciclo")).toBeLessThan(foundHtml.indexOf("EncountersList"));
    expect(foundHtml.indexOf("Contexto clínico del ciclo")).toBeLessThan(foundHtml.indexOf("EncountersList"));
    expect(foundHtml.indexOf("Tendencia funcional")).toBeLessThan(foundHtml.indexOf("EncountersList"));
    expect(foundHtml.indexOf("Resumen del ciclo")).toBeLessThan(foundHtml.indexOf("EncountersList"));
    expect(foundHtml).toContain("Visitas del tratamiento");
    expect(foundHtml).not.toContain("Puntualidad:");
    expect(foundHtml).toContain("Primera visita");
    expect(foundHtml).toContain("Frecuencia promedio");
    expect(foundHtml).toContain("Aún no calculable");
    expect(foundHtml).not.toContain("Excluidas del cálculo de duración");
  });

  it("renders active treatment context when closed cycles also exist", async () => {
    const closedEpisodeRecent = {
      id: "episode-closed-recent",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
    };
    const activeEpisode = {
      id: "episode-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-05-01",
    };

    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        operationalStatus: "active_treatment",
      },
      activeEpisode,
      mostRecentEpisode: closedEpisodeRecent,
      encounters: [],
      functionalTrend: [],
      clinicalContext: { hasAnyContent: false },
      encounterStats: {
        totalCount: 0,
        treatmentCount: 0,
        lastStartedAt: null,
        averageDurationMinutes: null,
        totalDurationMinutes: null,
        durationEligibleCount: 0,
        durationExcludedCount: 0,
        isDurationPartial: false,
        daysToFirstVisitFromEpisodeStart: null,
        isFirstVisitBeforeEpisodeStart: false,
        averageDaysBetweenEpisodeVisits: null,
        frequencyEligibleVisitCount: 0,
        frequencyIntervalCount: 0,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });

    const element = await AdminPatientEncountersPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Tratamiento activo");
    expect(html).toContain("Inicio: 01/05/2026");
    expect(html).toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(html).toContain("Registrar visita");
    expect(html).not.toContain("Tratamiento finalizado. Las visitas quedan disponibles como historial.");
    expect(html).not.toContain("Finalización: 31/03/2026");
    expect(html).not.toContain("Tendencia funcional");
    expect(html).not.toContain("Estado del ciclo:");
    expect(html).not.toContain("Cierre:</span> 31/03/2026");
  });

  it("shows duration helper and rhythm cards with expected copy", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        operationalStatus: "active_treatment",
      },
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      mostRecentEpisode: null,
      encounters: [],
      functionalTrend: [],
      clinicalContext: {
        hasAnyContent: true,
        therapeuticGoals: "Recuperar marcha funcional",
      },
      encounterStats: {
        totalCount: 5,
        treatmentCount: 4,
        lastStartedAt: "2026-04-17T08:00:00Z",
        averageDurationMinutes: null,
        totalDurationMinutes: null,
        durationEligibleCount: 3,
        durationExcludedCount: 2,
        isDurationPartial: true,
        daysToFirstVisitFromEpisodeStart: 1,
        isFirstVisitBeforeEpisodeStart: false,
        averageDaysBetweenEpisodeVisits: 0.75,
        frequencyEligibleVisitCount: 4,
        frequencyIntervalCount: 3,
        punctualityWithDataCount: 10,
        punctualityOnTimeOrMinorDelayCount: 8,
        punctualityMissingCount: 2,
      },
    });

    const element = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Duración promedio");
    expect(html).toContain("Tiempo total registrado");
    expect(html).not.toContain("Excluidas del cálculo de duración");
    expect(html).toContain("4 visitas del tratamiento");
    expect(html).toContain("Última visita:");
    expect(html).toContain("17/04/2026");
    expect(html).toContain("Sin tendencia funcional");
    expect(html).toContain("Contexto cargado");
    expect(html).toContain("<summary");
    expect(html).not.toMatch(/<details[^>]*aria-label="Seguimiento rápido del ciclo"[^>]*open=""/);
    expect(html).toContain("Primera visita");
    expect(html).toContain("Al día siguiente del inicio");
    expect(html).toContain("Frecuencia promedio");
    expect(html).toContain("Menos de 1 día");
    expect(html).toMatch(/Duración promedio<\/p><p[^>]*>—<\/p>/);
    expect(html).toContain("* Duración calculada sobre 3 de 4 visitas del tratamiento. Se excluyen visitas sin cierre, legacy o con fechas no válidas.");
    expect(html).toContain("Puntualidad: 8/10 en horario o demora leve");
    expect(html).toContain("2 sin dato");
  });

  it("renders frequency singular/plural and first-visit anomaly copy", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        operationalStatus: "active_treatment",
      },
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      mostRecentEpisode: null,
      encounters: [],
      functionalTrend: [],
      encounterStats: {
        totalCount: 3,
        treatmentCount: 3,
        lastStartedAt: "2026-04-17T08:00:00Z",
        averageDurationMinutes: 45,
        totalDurationMinutes: 135,
        durationEligibleCount: 3,
        durationExcludedCount: 0,
        isDurationPartial: false,
        daysToFirstVisitFromEpisodeStart: -1,
        isFirstVisitBeforeEpisodeStart: true,
        averageDaysBetweenEpisodeVisits: 1.2,
        frequencyEligibleVisitCount: 3,
        frequencyIntervalCount: 2,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });

    const element = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Antes del inicio registrado");
    expect(html).toContain("Una visita cada 1 día");

    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        operationalStatus: "active_treatment",
      },
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      mostRecentEpisode: null,
      encounters: [],
      functionalTrend: [],
      encounterStats: {
        totalCount: 3,
        treatmentCount: 3,
        lastStartedAt: "2026-04-17T08:00:00Z",
        averageDurationMinutes: 45,
        totalDurationMinutes: 135,
        durationEligibleCount: 3,
        durationExcludedCount: 0,
        isDurationPartial: false,
        daysToFirstVisitFromEpisodeStart: 3,
        isFirstVisitBeforeEpisodeStart: false,
        averageDaysBetweenEpisodeVisits: 3.2,
        frequencyEligibleVisitCount: 3,
        frequencyIntervalCount: 2,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });

    const elementPlural = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const htmlPlural = renderToStaticMarkup(elementPlural);

    expect(htmlPlural).toContain("A los 3 días del inicio");
    expect(htmlPlural).toContain("Una visita cada 3 días");
  });

  it("shows a single blocking signal and keeps no-CTA behavior without active treatment", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        dni: "30111222",
        operationalStatus: "ready_to_start",
      },
      activeEpisode: null,
      mostRecentEpisode: null,
      encounters: [],
      functionalTrend: [],
      encounterStats: {
        totalCount: 0,
        treatmentCount: 0,
        lastStartedAt: null,
        averageDurationMinutes: null,
        totalDurationMinutes: null,
        durationEligibleCount: 0,
        durationExcludedCount: 0,
        isDurationPartial: false,
        daysToFirstVisitFromEpisodeStart: null,
        isFirstVisitBeforeEpisodeStart: false,
        averageDaysBetweenEpisodeVisits: null,
        frequencyEligibleVisitCount: 0,
        frequencyIntervalCount: 0,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });

    const foundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const foundHtml = renderToStaticMarkup(foundElement);

    expect(foundHtml).toContain("Sin tratamiento iniciado");
    expect(foundHtml).toContain("No hay un tratamiento iniciado para este paciente.");
    expect(foundHtml).toContain("No podés registrar visitas hasta tener un tratamiento activo.");
    expect(foundHtml).toContain("Ir a gestión de tratamiento");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(foundHtml).not.toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(foundHtml).toContain("EncountersList");
  });

  it("renders read-only clinical context only when there is content and keeps secondary edit link", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: {
        id: "pat-1",
        fullName: "Ana Pérez",
        operationalStatus: "active_treatment",
      },
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      mostRecentEpisode: null,
      clinicalContext: {
        hasAnyContent: true,
        medicalReferenceDiagnosisText: "Lumbalgia",
      },
      encounters: [],
      functionalTrend: [],
      encounterStats: {
        totalCount: 0, treatmentCount: 0, lastStartedAt: null, averageDurationMinutes: null, totalDurationMinutes: null,
        durationEligibleCount: 0, durationExcludedCount: 0, isDurationPartial: false, daysToFirstVisitFromEpisodeStart: null,
        isFirstVisitBeforeEpisodeStart: false, averageDaysBetweenEpisodeVisits: null, frequencyEligibleVisitCount: 0, frequencyIntervalCount: 0,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });
    const withContext = renderToStaticMarkup(await AdminPatientEncountersPage({ params: Promise.resolve({ id: "pat-1" }) }));
    expect(withContext).toContain("Contexto clínico del ciclo");
    expect(withContext).toContain("0 visitas del tratamiento");
    expect(withContext).toContain("Última visita: sin visitas");
    expect(withContext).toContain("Sin tendencia funcional");
    expect(withContext).toContain("Contexto cargado");
    expect(withContext).toMatch(/<details[^>]*aria-label="Seguimiento rápido del ciclo"[^>]*open=""/);
    expect(withContext).toContain("Ver detalle longitudinal");
    expect(withContext).toContain("Este contexto se consulta en modo lectura desde Gestión clínica y se edita en Tratamiento.");
    expect(withContext).toContain("Ver/editar en Tratamiento");
    expect(withContext).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(withContext).toContain("Registrar visita");
    expect(withContext).not.toContain("Estado del ciclo:");
    expect(withContext).not.toContain("Inicio:</span>");
    expect(withContext).not.toContain("<textarea");

    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: { id: "pat-1", fullName: "Ana Pérez", operationalStatus: "active_treatment" },
      activeEpisode: { id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-04-01" },
      mostRecentEpisode: null,
      clinicalContext: { hasAnyContent: false },
      encounters: [],
      functionalTrend: [],
      encounterStats: {
        totalCount: 0, treatmentCount: 0, lastStartedAt: null, averageDurationMinutes: null, totalDurationMinutes: null,
        durationEligibleCount: 0, durationExcludedCount: 0, isDurationPartial: false, daysToFirstVisitFromEpisodeStart: null,
        isFirstVisitBeforeEpisodeStart: false, averageDaysBetweenEpisodeVisits: null, frequencyEligibleVisitCount: 0, frequencyIntervalCount: 0,
        punctualityWithDataCount: 0,
        punctualityOnTimeOrMinorDelayCount: 0,
        punctualityMissingCount: 0,
      },
    });
    const withoutContext = renderToStaticMarkup(await AdminPatientEncountersPage({ params: Promise.resolve({ id: "pat-1" }) }));
    expect(withoutContext).toContain("Contexto clínico del ciclo");
    expect(withoutContext).toContain("0 visitas del tratamiento");
    expect(withoutContext).toContain("Última visita: sin visitas");
    expect(withoutContext).toContain("Sin tendencia funcional");
    expect(withoutContext).toContain("Falta contexto");
    expect(withoutContext).toMatch(/<details[^>]*aria-label="Seguimiento rápido del ciclo"[^>]*open=""/);
    expect(withoutContext).toContain("Ver detalle longitudinal");
    expect(withoutContext).toContain("Sin dato");
  });

  it("shows compact historical context when treatment is finished", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: { id: "pat-1", fullName: "Ana Pérez", operationalStatus: "finished_treatment" },
      activeEpisode: null,
      mostRecentEpisode: { id: "epi-2", patientId: "pat-1", status: "finished", startDate: "2026-03-01", endDate: "2026-03-20", closureReason: "treatment_completed", closureDetail: "Alta funcional" },
      encounters: [],
      functionalTrend: [],
      clinicalContext: { hasAnyContent: true, therapeuticGoals: "Alta con independencia funcional" },
      encounterStats: { totalCount: 0, treatmentCount: 0, lastStartedAt: null, averageDurationMinutes: null, totalDurationMinutes: null, durationEligibleCount: 0, durationExcludedCount: 0, isDurationPartial: false, daysToFirstVisitFromEpisodeStart: null, isFirstVisitBeforeEpisodeStart: false, averageDaysBetweenEpisodeVisits: null, frequencyEligibleVisitCount: 0, frequencyIntervalCount: 0, punctualityWithDataCount: 0, punctualityOnTimeOrMinorDelayCount: 0, punctualityMissingCount: 0 },
    });

    const element = await AdminPatientEncountersPage({ params: Promise.resolve({ id: "pat-1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Visitas en modo historial.");
    expect(html).toContain("Ver detalle longitudinal");
    expect(html).toContain("Ver/editar en Tratamiento");
    expect(html).not.toContain("Estado del ciclo:");
    expect(html).not.toContain("Cierre:</span> 20/03/2026");
  });

});
