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

    expect(html).toContain("Contexto general del tratamiento");
    expect(html).toContain("organiza el tratamiento sin reemplazar el registro de visitas");
    expect(html).toContain("Referencia inicial");
    expect(html).toContain("Síntesis kinésica");
    expect(html).toContain("Dirección terapéutica");
    expect(html).toContain("Editar diagnóstico médico de referencia");
    expect(html).toContain("Editar diagnóstico kinésico actual");
    expect(html).toContain("Editar situación funcional al inicio");
    expect(html).toContain("Editar objetivos del tratamiento");
    expect(html).toContain("Editar plan general del tratamiento");
    expect(html).toContain("diagnóstico con el que llega o fue derivado este tratamiento");
    expect(html).toContain("lectura funcional actual que organiza el tratamiento");
    expect(html).toContain("problema funcional que organiza este tratamiento desde la mirada kinésica actual");
    expect(html).toContain("cómo estaba la persona al comenzar este tratamiento");
    expect(html).toContain("Base clínica y funcional con la que se inicia o se encuadra este tratamiento");
    expect(html).toContain("metas observables o verificables del ciclo");
    expect(html).toContain("estrategia general, la frecuencia orientativa y los ejes de trabajo");
    expect(html).toContain("Metas y plan general que orientan el tratamiento a lo largo del ciclo");
    expect(html).not.toContain("Guardar contexto clínico");
  });
});
