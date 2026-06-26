import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/encounters/actions/update-encounter-clinical-note.action", () => ({
  updateEncounterClinicalNoteAction: vi.fn(),
}));

import {
  EncounterClinicalNoteEditor,
  getEncounterClinicalNoteEditorActionLabel,
} from "./EncounterClinicalNoteEditor";

(globalThis as { React?: typeof React }).React = React;

const encounter = {
  id: "enc-1",
  patientId: "pat-1",
  episodeOfCareId: "epi-1",
  status: "finished" as const,
  startedAt: "2026-04-17T10:30:00Z",
  endedAt: "2026-04-17T11:00:00Z",
  clinicalNote: {
    subjective: "Refiere menor dolor",
    intervention: "Marcha asistida",
  },
};

describe("EncounterClinicalNoteEditor", () => {
  it("uses edit action label when clinical note has content", () => {
    expect(getEncounterClinicalNoteEditorActionLabel(encounter)).toBe("Editar nota clínica");
  });

  it("uses complete action label when clinical note is empty", () => {
    expect(getEncounterClinicalNoteEditorActionLabel({
      ...encounter,
      clinicalNote: undefined,
    })).toBe("Completar nota clínica");
  });

  it("renders closed secondary action", () => {
    const html = renderToStaticMarkup(createElement(EncounterClinicalNoteEditor, {
      patientId: "pat-1",
      encounter,
      isOpen: false,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    }));

    expect(html).toContain("Editar nota clínica");
    expect(html).not.toContain("Resumen compartible de visita");
    expect(html).not.toMatch(/WhatsApp/i);
  });

  it("renders inline form with current values and internal-source helper", () => {
    const html = renderToStaticMarkup(createElement(EncounterClinicalNoteEditor, {
      patientId: "pat-1",
      encounter,
      isOpen: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    }));

    expect(html).toContain("Nota clínica estructurada");
    expect(html).toContain("Esta nota es la fuente clínica interna de la visita.");
    expect(html).toContain("intervención, indicaciones domiciliarias y próximo plan");
    expect(html).toContain("Subjetivo / referido por paciente");
    expect(html).toContain("Objetivo / observado");
    expect(html).toContain("Intervención realizada");
    expect(html).toContain("Evaluación o respuesta clínica");
    expect(html).toContain("Tolerancia");
    expect(html).toContain("Indicaciones domiciliarias");
    expect(html).toContain("Próximo plan");
    expect(html).toContain("síntomas, cambios percibidos, dificultades o comentarios relevantes");
    expect(html).toContain("Qué observás durante la visita");
    expect(html).toContain("mejora mucho la utilidad del resumen compartible");
    expect(html).toContain("Interpretación clínica de la visita");
    expect(html).toContain("fatiga, dolor, síntomas o respuesta al esfuerzo");
    expect(html).toContain("Refiere menor dolor");
    expect(html).toContain("Marcha asistida");
    expect(html).toContain("Guardar nota clínica");
    expect(html).toContain("Cancelar sin guardar");
    expect(html).not.toMatch(/WhatsApp/i);
  });

  it("renders empty-state copy when note is missing", () => {
    const html = renderToStaticMarkup(createElement(EncounterClinicalNoteEditor, {
      patientId: "pat-1",
      encounter: {
        ...encounter,
        clinicalNote: undefined,
      },
      isOpen: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    }));

    expect(html).toContain("Todavía no hay nota clínica registrada para esta visita.");
  });
});
