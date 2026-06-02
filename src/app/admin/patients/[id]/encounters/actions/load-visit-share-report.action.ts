"use server";

import { composeVisitShareReport } from "@/features/visit-share-report/visit-share-report.composer";
import { loadEncounterShareableReportContext } from "@/features/visit-share-report/visit-share-report.read-model";
import type {
  VisitShareReportCompositionResult,
  VisitShareReportRecipientOption,
} from "@/features/visit-share-report/visit-share-report.types";

export interface LoadVisitShareReportActionResult {
  ok: boolean;
  report?: VisitShareReportCompositionResult;
  recipients?: VisitShareReportRecipientOption[];
  message?: string;
}

export async function loadVisitShareReportAction(input: unknown): Promise<LoadVisitShareReportActionResult> {
  try {
    const patientId = typeof input === "object" && input !== null && "patientId" in input
      ? String(input.patientId ?? "").trim()
      : "";
    const encounterId = typeof input === "object" && input !== null && "encounterId" in input
      ? String(input.encounterId ?? "").trim()
      : "";

    if (!patientId || !encounterId) {
      return {
        ok: false,
        message: "No se pudo identificar la visita seleccionada.",
      };
    }

    const context = await loadEncounterShareableReportContext({ patientId, encounterId });

    if (!context) {
      return {
        ok: false,
        message: "No se encontraron datos suficientes de la visita seleccionada.",
      };
    }

    return {
      ok: true,
      report: composeVisitShareReport(context),
      recipients: context.patient.recipientOptions,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo preparar el resumen compartible.",
    };
  }
}
