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
      },
    });

    const foundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const foundHtml = renderToStaticMarkup(foundElement);

    expect(foundHtml).toContain("← Volver al paciente");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1\"");
    expect(foundHtml).toContain("Ana Pérez");
    expect(foundHtml).toContain("Registro y seguimiento de visitas del paciente.");
    expect(foundHtml).toContain("DNI: 30.111.222");
    expect(foundHtml).toContain("Tratamiento activo");
    expect(foundHtml).toContain("Inicio: 01/04/2026");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(foundHtml).toContain("Registrar visita");
    expect(foundHtml.match(/href=\"\/admin\/patients\/pat-1\/encounters\/new\"/g)?.length).toBe(1);
    expect(foundHtml).toContain("Gestionar tratamiento");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(foundHtml).toContain("Estadísticas de visitas");
    expect(foundHtml).toContain("Visitas del tratamiento");
    expect(foundHtml).not.toContain("Visitas registradas");
    expect(foundHtml).toContain("Primera visita");
    expect(foundHtml).toContain("Frecuencia promedio");
    expect(foundHtml).toContain("Aún no calculable");
    expect(foundHtml).not.toContain("Excluidas del cálculo de duración");
    expect(foundHtml).toContain("EncountersList");
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
      },
    });

    const element = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Duración promedio");
    expect(html).toContain("Tiempo total registrado");
    expect(html).not.toContain("Excluidas del cálculo de duración");
    expect(html).toContain("Primera visita");
    expect(html).toContain("Al día siguiente del inicio");
    expect(html).toContain("Frecuencia promedio");
    expect(html).toContain("Menos de 1 día");
    expect(html).toMatch(/Duración promedio<\/p><p[^>]*>—<\/p>/);
    expect(html).toContain("* Duración calculada sobre 3 de 4 visitas del tratamiento. Se excluyen visitas sin cierre, legacy o con fechas no válidas.");
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
      encounterStats: {
        totalCount: 3,
        treatmentCount: 3,
        lastStartedAt: "2026-04-17T08:00:00Z",
        averageDurationMinutes: 45,
        totalDurationMinutes: 135,
        durationEligibleCount: 3,
        durationExcludedCount: 0,
        isDurationPartial: false,
        daysToFirstVisitFromEpisodeStart: 3.2,
        isFirstVisitBeforeEpisodeStart: false,
        averageDaysBetweenEpisodeVisits: 3.2,
        frequencyEligibleVisitCount: 3,
        frequencyIntervalCount: 2,
      },
    });

    const elementPlural = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const htmlPlural = renderToStaticMarkup(elementPlural);

    expect(htmlPlural).toContain("A los 4 días del inicio");
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
      },
    });

    const foundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const foundHtml = renderToStaticMarkup(foundElement);

    expect(foundHtml).toContain("Sin tratamiento iniciado");
    expect(foundHtml).toContain("No hay un tratamiento iniciado para este paciente.");
    expect(foundHtml).toContain("Necesitás un tratamiento activo para registrar visitas.");
    expect(foundHtml).toContain("Ir a gestión de tratamiento");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(foundHtml).not.toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(foundHtml).toContain("EncountersList");
  });
});
