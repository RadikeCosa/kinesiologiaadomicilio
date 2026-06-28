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
        medicalReferenceDiagnosisText: "Lumbalgia mecánica",
        kinesiologicDiagnosisText: "Disfunción lumbopélvica",
        ctaLabel: "Ver gestión clínica",
      },
      briefClinicalSignal: "Dolor: 4/10",
    }));
    expect(html).toContain("Estado actual");
    expect(html).toContain("Orientación breve del caso. El detalle está en Gestión clínica y Tratamiento.");
    expect(html).toContain("Estado del tratamiento:</span> Tratamiento activo");
    expect(html).toContain("Última visita:</span> 08/05/2026");
    expect(html).toContain("Visitas del episodio:</span> 4");
    expect(html).toContain("Señal clínica breve:</span> Dolor: 4/10");
    expect(html).not.toContain("Diagnóstico médico:");
    expect(html).not.toContain("Impresión kinésica:");
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
      },
      briefClinicalSignal: "Marco clínico incompleto",
    }));
    expect(html).toContain("Señal clínica breve:</span> Marco clínico incompleto");
    expect(html).toContain("Aún no registrada");
    expect(html).toContain("Registrar primera visita");
  });
});
