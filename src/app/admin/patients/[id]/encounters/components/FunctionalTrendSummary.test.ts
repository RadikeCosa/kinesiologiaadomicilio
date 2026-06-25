import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FunctionalTrendSummary } from "@/app/admin/patients/[id]/encounters/components/FunctionalTrendSummary";

(globalThis as { React?: typeof React }).React = React;

describe("FunctionalTrendSummary", () => {
  it("does not render when trend is empty", () => {
    const html = renderToStaticMarkup(createElement(FunctionalTrendSummary, { trend: [] }));
    expect(html).toBe("");
  });

  it("renders canonical order and latest/previous/delta hierarchy", () => {
    const html = renderToStaticMarkup(
      createElement(FunctionalTrendSummary, {
        trend: [
          { code: "tug_seconds", label: "TUG", latestValue: 18, latestDate: "2026-05-08", previousValue: 20, previousDate: "2026-05-01", delta: -2, unit: "s" },
          { code: "pain_nrs_0_10", label: "Dolor", latestValue: 5, latestDate: "2026-05-08", previousValue: 6, previousDate: "2026-05-01", delta: -1, unit: "/10" },
          { code: "standing_tolerance_minutes", label: "Bipedestación", latestValue: 8, latestDate: "2026-05-08", previousValue: 6, previousDate: "2026-05-01", delta: 2, unit: "min" },
          { code: "gait_duration_minutes", label: "Marcha", latestValue: 4, latestDate: "2026-05-08", previousValue: 4, previousDate: "2026-05-01", delta: 0, unit: "min" },
        ],
      }),
    );

    expect(html).toContain("Tendencia funcional");
    expect(html).toContain("Último");
    expect(html).toContain("Previo:");
    expect(html).toContain("Cambio:");
    expect(html).not.toContain("mejoró");
    expect(html).not.toContain("empeoró");

    expect(html.indexOf("TUG")).toBeLessThan(html.indexOf("Dolor"));
    expect(html.indexOf("Dolor")).toBeLessThan(html.indexOf("Bipedestación"));
    expect(html.indexOf("Bipedestación")).toBeLessThan(html.indexOf("Marcha"));
  });

  it("renders rounded decimal display for trend values and deltas", () => {
    const html = renderToStaticMarkup(
      createElement(FunctionalTrendSummary, {
        trend: [
          {
            code: "tug_seconds",
            label: "TUG",
            latestValue: 18.555,
            latestDate: "2026-05-08",
            previousValue: 19.888,
            previousDate: "2026-05-01",
            delta: -1.3333,
            unit: "s",
          },
          {
            code: "standing_tolerance_minutes",
            label: "Bipedestación",
            latestValue: 6,
            latestDate: "2026-05-08",
            previousValue: 4.666,
            previousDate: "2026-05-01",
            delta: 1.334,
            unit: "min",
          },
        ],
      }),
    );

    expect(html).toContain("18.6 s");
    expect(html).toContain("19.9 s");
    expect(html).toContain("-1.3 s");
    expect(html).toContain("6 min");
    expect(html).toContain("4.7 min");
    expect(html).toContain("+1.3 min");
  });

  it("renders single-measure state as sin comparación previa", () => {
    const html = renderToStaticMarkup(
      createElement(FunctionalTrendSummary, {
        trend: [
          { code: "pain_nrs_0_10", label: "Dolor", latestValue: 3, latestDate: "2026-05-08", previousValue: undefined, previousDate: undefined, delta: undefined, unit: "/10" },
        ],
      }),
    );

    expect(html).toContain("Sin comparación previa");
    expect(html).not.toContain("Previo:");
    expect(html).not.toContain("Cambio:");
  });
});
