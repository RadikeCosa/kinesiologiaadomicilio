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
    expect(html).toContain("Completitud:</span> 5/5");
    expect(html).toContain("Diagnóstico médico de referencia:");
    expect(html).toContain("Diagnóstico kinésico:");
    expect(html).toContain("Situación funcional inicial:");
    expect(html).toContain("Objetivo de tratamiento:");
    expect(html).toContain("Plan marco del tratamiento:");
    expect(html).toContain("Ver/editar marco clínico en Tratamiento");
    expect(html).toContain("<details");
    expect(html).not.toContain("Impresión kinésica");
  });

  it("renders compact empty active context with complete CTA", () => {
    const html = renderToStaticMarkup(createElement(ClinicalCycleContextCard, {
      patientId: "pat-1",
      activeEpisode: { id: "epi-1", startDate: "2026-04-01" },
      mostRecentEpisode: { id: "epi-1", status: "active", startDate: "2026-04-01" },
      clinicalContext: { hasAnyContent: false },
    }));

    expect(html).toContain("Completitud:</span> 0/5");
    expect(html).toContain("Completar marco clínico en Tratamiento");
    expect(html).toContain("Este ciclo aún no tiene contexto clínico completo. Completá el marco clínico en Tratamiento.");
    expect(html).not.toContain("<details");
  });
});
