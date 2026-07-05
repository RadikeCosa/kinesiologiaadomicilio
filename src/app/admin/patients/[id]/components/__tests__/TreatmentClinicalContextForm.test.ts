import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action", () => ({
  updateTreatmentClinicalContextFieldAction: vi.fn(),
}));

import {
  buildFormValues,
  getChangedFieldKeys,
  normalizeFormValues,
  resetDraftValues,
  TreatmentClinicalContextForm,
} from "@/app/admin/patients/[id]/components/TreatmentClinicalContextForm";

(globalThis as { React?: typeof React }).React = React;

const initialData = {
  hasAnyContent: true,
  medicalReferenceDiagnosisText: "Lumbalgia",
  kinesiologicDiagnosisText: "Alteración de la marcha",
  initialFunctionalStatus: "Dolor al caminar",
  therapeuticGoals: "Mejorar tolerancia",
  frameworkPlan: "Movilidad progresiva",
};

describe("TreatmentClinicalContextForm", () => {
  it("renders read mode with a single edit CTA and the expected field order", () => {
    const html = renderToStaticMarkup(createElement(TreatmentClinicalContextForm, {
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      initialData,
    }));

    expect(html).toContain("Contexto general del tratamiento");
    expect(html).toContain("Este bloque organiza el tratamiento a lo largo del ciclo y no reemplaza el registro de visitas.");
    expect(html).toContain("Editar contexto clínico");
    expect(html).toContain("Situación funcional inicial");
    expect(html).toContain("Diagnóstico médico de referencia");
    expect(html).toContain("Diagnóstico kinésico actual");
    expect(html).toContain("Objetivos del tratamiento");
    expect(html).toContain("Plan general del tratamiento");
    expect(html.indexOf("Situación funcional inicial")).toBeLessThan(html.indexOf("Diagnóstico médico de referencia"));
    expect(html.indexOf("Diagnóstico médico de referencia")).toBeLessThan(html.indexOf("Diagnóstico kinésico actual"));
    expect(html.indexOf("Diagnóstico kinésico actual")).toBeLessThan(html.indexOf("Objetivos del tratamiento"));
    expect(html.indexOf("Objetivos del tratamiento")).toBeLessThan(html.indexOf("Plan general del tratamiento"));
    expect(html).not.toContain("Guardar cambios");
  });

  it("renders edit mode as a single block with one footer of actions", () => {
    const html = renderToStaticMarkup(createElement(TreatmentClinicalContextForm, {
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      initialData,
      initialEditing: true,
    }));

    expect(html).toContain("Guardar cambios");
    expect(html).toContain("Cancelar");
    expect(html).not.toContain("Editar contexto clínico");
    expect(html.match(/<textarea/g)?.length).toBe(5);
  });

  it("tracks multiple edited fields in block order", () => {
    const persistedValues = buildFormValues(initialData);
    const draftValues = {
      ...persistedValues,
      initialFunctionalStatus: "Camina con menos dolor",
      therapeuticGoals: "Mejorar equilibrio",
    };

    expect(getChangedFieldKeys(persistedValues, draftValues)).toEqual([
      "initialFunctionalStatus",
      "therapeuticGoals",
    ]);
  });

  it("normalizes values before comparing changes", () => {
    const persistedValues = buildFormValues(initialData);
    const draftValues = {
      ...persistedValues,
      medicalReferenceDiagnosis: "  Lumbalgia  ",
    };

    expect(normalizeFormValues(draftValues).medicalReferenceDiagnosis).toBe("Lumbalgia");
    expect(getChangedFieldKeys(persistedValues, draftValues)).toEqual([]);
  });

  it("restores the persisted draft on cancel so unsaved values do not become visible as persisted", () => {
    const persistedValues = buildFormValues(initialData);
    const dirtyDraftValues = {
      ...persistedValues,
      frameworkPlan: "Nuevo plan sin guardar",
      therapeuticGoals: "Otro objetivo",
    };

    const cancelledDraftValues = resetDraftValues(persistedValues);

    expect(dirtyDraftValues.frameworkPlan).toBe("Nuevo plan sin guardar");
    expect(cancelledDraftValues.frameworkPlan).toBe("Movilidad progresiva");
    expect(cancelledDraftValues.therapeuticGoals).toBe("Mejorar tolerancia");
    expect(cancelledDraftValues).toEqual(persistedValues);
  });

  it("renders subtle empty-state values without making them dominant", () => {
    const html = renderToStaticMarkup(createElement(TreatmentClinicalContextForm, {
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      initialData: {
        hasAnyContent: false,
      },
    }));

    expect(html).toContain("Sin dato");
    expect(html).not.toContain("No registrado");
  });
});
