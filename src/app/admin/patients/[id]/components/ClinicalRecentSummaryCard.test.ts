import React, { createElement } from "react";
(globalThis as { React?: typeof React }).React = React;
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ClinicalRecentSummaryCard } from "@/app/admin/patients/[id]/components/ClinicalRecentSummaryCard";

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

describe("ClinicalRecentSummaryCard", () => {
  it("renders active with visits and metrics", () => {
    const html = renderToStaticMarkup(createElement(ClinicalRecentSummaryCard, {
      patientId: "pat-1",
      summary: {
        treatmentStatusLabel: "Tratamiento activo",
        latestEncounterLabel: "2026-05-08T12:00:00.000Z",
        encountersCount: 4,
        metrics: [{ label: "Dolor", value: "4/10" }, { label: "Marcha", value: "12 min" }],
        metricsEmptyLabel: "Sin registros funcionales todavía",
        ctaLabel: "Ver gestión clínica",
        medicalDiagnosisLabel: "Lumbalgia",
        kinesiologicImpressionLabel: "Dolor lumbar mecánico",
        clinicalContextIncomplete: false,
      },
    }));
    expect(html).toContain("Resumen clínico reciente");
    expect(html).toContain("Síntesis rápida. El detalle está en Gestión clínica.");
    expect(html).toContain("Estado del tratamiento:</span> Tratamiento activo");
    expect(html).toContain("Última visita:</span> 08/05/2026");
    expect(html).toContain("Visitas del episodio:</span> 4");
    expect(html).toContain("Diagnóstico médico:</span> Lumbalgia");
    expect(html).toContain("Impresión kinésica:</span> Dolor lumbar mecánico");
    expect(html).toContain("Dolor: 4/10 · Marcha: 12 min");
    expect(html).toContain("Ver gestión clínica");
  });

  it("renders empty states and registration CTA", () => {
    const html = renderToStaticMarkup(createElement(ClinicalRecentSummaryCard, {
      patientId: "pat-1",
      summary: {
        treatmentStatusLabel: "Nuevo tratamiento activo",
        latestEncounterLabel: "Aún no registrada",
        encountersCount: 0,
        metrics: [],
        metricsEmptyLabel: "Sin registros funcionales todavía",
        ctaLabel: "Registrar primera visita",
        clinicalContextIncomplete: true,
      },
    }));
    expect(html).toContain("Aún no registrada");
    expect(html).toContain("Sin registros funcionales todavía");
    expect(html).toContain("Registrar primera visita");
    expect(html).toContain("Marco clínico:</span> Incompleto");
  });
});
