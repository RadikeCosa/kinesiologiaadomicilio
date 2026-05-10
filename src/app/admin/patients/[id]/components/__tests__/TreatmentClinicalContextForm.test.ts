import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action", () => ({
  updateTreatmentClinicalContextFieldAction: vi.fn(),
}));

import { TreatmentClinicalContextForm } from "@/app/admin/patients/[id]/components/TreatmentClinicalContextForm";

(globalThis as { React?: typeof React }).React = React;

describe("TreatmentClinicalContextForm", () => {
  it("renderiza submits independientes por campo y no submit global", () => {
    const html = renderToStaticMarkup(createElement(TreatmentClinicalContextForm, {
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      initialData: {
        hasAnyContent: true,
        medicalReferenceDiagnosisText: "A",
        kinesiologicDiagnosisText: "B",
        initialFunctionalStatus: "C",
        therapeuticGoals: "D",
        frameworkPlan: "E",
      },
    }));

    expect(html).toContain("Guardar diagnóstico médico");
    expect(html).toContain("Guardar diagnóstico kinésico");
    expect(html).toContain("Guardar situación funcional");
    expect(html).toContain("Guardar objetivo");
    expect(html).toContain("Guardar plan marco");
    expect(html).not.toContain("Guardar contexto clínico");
  });
});
