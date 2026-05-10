import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action", () => ({
  updateTreatmentClinicalContextFieldAction: vi.fn(),
}));

import { TreatmentClinicalContextForm } from "@/app/admin/patients/[id]/components/TreatmentClinicalContextForm";

(globalThis as { React?: typeof React }).React = React;

describe("TreatmentClinicalContextForm", () => {
  it("renderiza campos en modo lectura con acciones independientes por campo", () => {
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

    expect(html).toContain("Editar diagnóstico médico de referencia");
    expect(html).toContain("Editar diagnóstico kinésico");
    expect(html).toContain("Editar situación funcional inicial");
    expect(html).toContain("Editar objetivo de tratamiento");
    expect(html).toContain("Editar plan marco del tratamiento");
    expect(html).not.toContain("Guardar contexto clínico");
  });
});
