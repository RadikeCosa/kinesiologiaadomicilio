import type { EncounterShareableReportContext, VisitShareReportCompositionResult } from "@/features/visit-share-report/visit-share-report.types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadEncounterShareableReportContext: vi.fn(),
  composeVisitShareReport: vi.fn(),
}));

vi.mock("@/features/visit-share-report/visit-share-report.read-model", () => ({
  loadEncounterShareableReportContext: mocks.loadEncounterShareableReportContext,
}));

vi.mock("@/features/visit-share-report/visit-share-report.composer", () => ({
  composeVisitShareReport: mocks.composeVisitShareReport,
}));

import { loadVisitShareReportAction } from "../load-visit-share-report.action";

const context: EncounterShareableReportContext = {
  patient: {
    displayName: "Ana Perez",
    recipientOptions: [
      {
        kind: "patient",
        displayName: "Ana Perez",
        phone: "+542995550101",
        hasWhatsAppCandidate: true,
      },
    ],
  },
  visit: {
    startedAt: "2026-06-02T13:00:00.000Z",
    functionalMetrics: [],
    clinicalNote: {
      intervention: "Ejercicios activos asistidos.",
    },
  },
  signingProfessional: {
    status: "ready",
    fullName: "Lic. Ramiro Gomez",
    roleTitle: "Kinesiologo",
    licenseNumber: "12345",
  },
};

const report: VisitShareReportCompositionResult = {
  initialText: "Resumen generado",
  warnings: [],
  includedSections: ["header", "intervention", "signature"],
  omittedSections: ["metrics", "home_instructions", "next_plan", "response"],
  completeness: {
    status: "ready",
    missing: [],
    warnings: [],
  },
};

describe("loadVisitShareReportAction", () => {
  beforeEach(() => {
    mocks.loadEncounterShareableReportContext.mockResolvedValue(context);
    mocks.composeVisitShareReport.mockReturnValue(report);
  });

  it("loads sanitized context and returns the composed report", async () => {
    const result = await loadVisitShareReportAction({
      patientId: " pat-1 ",
      encounterId: " enc-1 ",
    });

    expect(mocks.loadEncounterShareableReportContext).toHaveBeenCalledWith({
      patientId: "pat-1",
      encounterId: "enc-1",
    });
    expect(mocks.composeVisitShareReport).toHaveBeenCalledWith(context);
    expect(result).toEqual({
      ok: true,
      report,
      recipients: context.patient.recipientOptions,
    });
  });

  it("returns an error when identifiers are missing", async () => {
    const result = await loadVisitShareReportAction({
      patientId: "pat-1",
      encounterId: "",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toBe("No se pudo identificar la visita seleccionada.");
    expect(mocks.loadEncounterShareableReportContext).not.toHaveBeenCalled();
  });

  it("returns an error when the context cannot be loaded", async () => {
    mocks.loadEncounterShareableReportContext.mockResolvedValue(null);

    const result = await loadVisitShareReportAction({
      patientId: "pat-1",
      encounterId: "enc-1",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toBe("No se encontraron datos suficientes de la visita seleccionada.");
    expect(mocks.composeVisitShareReport).not.toHaveBeenCalled();
  });
});
