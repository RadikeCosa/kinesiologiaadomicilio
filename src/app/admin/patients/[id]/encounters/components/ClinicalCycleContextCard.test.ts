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
  it("renders complete active context with edit CTA and details", () => {
    const html = renderToStaticMarkup(createElement(ClinicalCycleContextCard, {
      patientId: "pat-1",
      activeEpisode: { id: "epi-1", startDate: "2026-04-01" },
      mostRecentEpisode: { id: "epi-1", status: "active", startDate: "2026-04-01" },
      clinicalContext: {
        hasAnyContent: true, medicalReferenceDiagnosisText: "Lumbalgia", initialFunctionalStatus: "Marcha limitada", therapeuticGoals: "Reducir dolor y recuperar autonomía", frameworkPlan: "Plan general", kinesiologicImpressionText: "Compromiso lumbar",
      },
    }));

    expect(html).toContain("Estado del ciclo:</span> Activo");
    expect(html).toContain("Completitud:</span> Completo");
    expect(html).toContain("Objetivo principal:");
    expect(html).toContain("Diagnóstico de referencia:");
    expect(html).toContain("Estado funcional inicial:");
    expect(html).toContain("Editar en Tratamiento");
    expect(html).toContain("<details");
  });

  it("renders compact empty active context with complete CTA", () => {
    const html = renderToStaticMarkup(createElement(ClinicalCycleContextCard, {
      patientId: "pat-1",
      activeEpisode: { id: "epi-1", startDate: "2026-04-01" },
      mostRecentEpisode: { id: "epi-1", status: "active", startDate: "2026-04-01" },
      clinicalContext: { hasAnyContent: false },
    }));

    expect(html).toContain("Completitud:</span> Sin contexto");
    expect(html).toContain("Completar contexto en Tratamiento");
    expect(html).not.toContain("<details");
  });
});
