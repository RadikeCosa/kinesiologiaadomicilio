import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TREATMENT_REPORT_TEXTAREA_CLASS, TreatmentReportEditor } from "@/app/admin/patients/[id]/treatment/report/components/TreatmentReportEditor";

(globalThis as { React?: typeof React }).React = React;

describe("TreatmentReportEditor", () => {
  it("renders completeness, warnings and local actions", () => {
    const html = renderToStaticMarkup(createElement(TreatmentReportEditor, {
      mode: "progress",
      report: {
        initialText: "Texto derivado del informe",
        warnings: ["Faltan metricas funcionales registradas para resumir cambios observables."],
        includedSections: ["header", "professional_summary", "continuity"],
        omittedSections: ["functional_metrics"],
        completeness: {
          status: "usable_with_warnings",
          missing: ["functional_metrics"],
          warnings: ["Faltan metricas funcionales registradas para resumir cambios observables."],
        },
      },
    }));

    expect(html).toContain("Texto final editable");
    expect(html).toContain("Regenerar desde datos");
    expect(html).toContain("Copiar");
    expect(html).toContain("Datos a revisar");
    expect(html).toContain("Texto editable del informe");
    expect(html).toContain(TREATMENT_REPORT_TEXTAREA_CLASS);
  });
});
