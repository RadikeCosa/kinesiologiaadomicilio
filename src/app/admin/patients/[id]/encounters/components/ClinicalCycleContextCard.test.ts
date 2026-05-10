import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ClinicalCycleContextCard } from "@/app/admin/patients/[id]/encounters/components/ClinicalCycleContextCard";

(globalThis as { React?: typeof React }).React = React;
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => createElement("a", { href, ...rest }, children),
}));

describe("ClinicalCycleContextCard", () => {
  it("renders compact read-only context with neutral secondary CTA", () => {
    const html = renderToStaticMarkup(createElement(ClinicalCycleContextCard, {
      patientId: "pat-1",
      activeEpisode: { id: "epi-1", startDate: "2026-04-01" },
      mostRecentEpisode: { id: "epi-1", status: "active", startDate: "2026-04-01" },
      clinicalContext: {
        hasAnyContent: true, medicalReferenceDiagnosisText: "Lumbalgia", initialFunctionalStatus: "Marcha limitada", therapeuticGoals: "Reducir dolor y recuperar autonomía", frameworkPlan: "Plan general", kinesiologicDiagnosisText: "Compromiso lumbar",
      },
    }));

    expect(html).toContain("Estado del ciclo:</span> Activo");
    expect(html).not.toContain("Completitud:");
    expect(html).toContain("Diagnóstico médico de referencia:");
    expect(html).toContain("Diagnóstico kinésico:");
    expect(html).toContain("Situación funcional inicial:");
    expect(html).toContain("Objetivo de tratamiento:");
    expect(html).toContain("Plan marco del tratamiento:");
    expect(html).toContain("Ver/editar en Tratamiento");
    expect(html).not.toContain("<details");
    expect(html).not.toContain("Impresión kinésica");
  });

  it("renders empty context with neutral placeholders", () => {
    const html = renderToStaticMarkup(createElement(ClinicalCycleContextCard, {
      patientId: "pat-1",
      activeEpisode: { id: "epi-1", startDate: "2026-04-01" },
      mostRecentEpisode: { id: "epi-1", status: "active", startDate: "2026-04-01" },
      clinicalContext: { hasAnyContent: false },
    }));

    expect(html).toContain("No registrado");
    expect(html).toContain("Ver/editar en Tratamiento");
    expect(html).toContain("Este ciclo todavía no registra contexto clínico.");
  });
});
