import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EncounterStatsSummary } from "@/app/admin/patients/[id]/encounters/components/EncounterStatsSummary";

(globalThis as { React?: typeof React }).React = React;

function buildStats(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

describe("EncounterStatsSummary", () => {
  it("does not render punctuality KPI when there is no punctuality data", () => {
    const html = renderToStaticMarkup(React.createElement(EncounterStatsSummary, { stats: buildStats({ treatmentCount: 4 }) }));
    expect(html).toContain("Resumen del ciclo");
    expect(html).toContain("Visitas del tratamiento");
    expect(html).toContain("Primera visita:");
    expect(html).toContain("Tiempo total registrado:");
    expect(html).not.toContain("Puntualidad:");
    expect(html).not.toContain("sin dato");
  });

  it("renders punctuality KPI and missing data detail when applicable", () => {
    const html = renderToStaticMarkup(React.createElement(EncounterStatsSummary, {
      stats: buildStats({
        treatmentCount: 12,
        punctualityWithDataCount: 10,
        punctualityOnTimeOrMinorDelayCount: 8,
        punctualityMissingCount: 2,
      }),
    }));

    expect(html).toContain("Resumen del ciclo");
    expect(html).toContain("Visitas del tratamiento");
    expect(html).toContain("Puntualidad: 8/10 en horario o demora leve");
    expect(html).toContain("2 sin dato");
  });
});
