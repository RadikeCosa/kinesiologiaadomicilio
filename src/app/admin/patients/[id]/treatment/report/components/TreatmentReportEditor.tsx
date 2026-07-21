"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type {
  TreatmentReportCompositionResult,
  TreatmentReportMode,
  TreatmentReportCompletenessStatus,
} from "@/features/treatment-report/treatment-report.types";
import type { TreatmentEvolutionReportType } from "@/domain/treatment-evolution-report/treatment-evolution-report.types";
import { TREATMENT_EVOLUTION_REPORT_TYPE_LABELS } from "@/domain/treatment-evolution-report/treatment-evolution-report.types";
import {
  applyTreatmentReportCopyFeedback,
  copyTreatmentReportText,
  createInitialTreatmentReportEditorState,
  editTreatmentReportText,
  resetGeneratedTreatmentReportText,
} from "@/app/admin/patients/[id]/treatment/report/components/treatment-report-editor.state";
import { saveTreatmentEvolutionReportAction } from "@/app/admin/patients/[id]/treatment/report/actions/save-treatment-evolution-report.action";

const COMPLETENESS_COPY: Record<TreatmentReportCompletenessStatus, {
  label: string;
  description: string;
  className: string;
}> = {
  ready: {
    label: "Listo",
    description: "El informe tiene datos suficientes para revisar y copiar.",
    className: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  usable_with_warnings: {
    label: "Revisar",
    description: "El informe puede usarse, pero faltan algunos datos relevantes.",
    className: "border-amber-300 bg-amber-50 text-amber-900",
  },
  insufficient: {
    label: "Insuficiente",
    description: "Faltan datos clinicos para armar un informe util.",
    className: "border-red-300 bg-red-50 text-red-900",
  },
};

interface TreatmentReportEditorProps {
  patientId: string;
  episodeId: string;
  mode: TreatmentReportMode;
  report: TreatmentReportCompositionResult;
}

export const TREATMENT_REPORT_TEXTAREA_CLASS = "mt-1 min-h-[28rem] w-full resize-y rounded border border-slate-300 bg-white p-3 text-sm text-slate-800";

export function TreatmentReportEditor({
  patientId,
  episodeId,
  mode,
  report,
}: TreatmentReportEditorProps) {
  const [state, setState] = useState(() => createInitialTreatmentReportEditorState(report.initialText));
  const [reportType, setReportType] = useState<TreatmentEvolutionReportType>(mode === "closure" ? "stage_closure" : "progress");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const presentation = COMPLETENESS_COPY[report.completeness.status];
  const textareaId = `treatment-report-text-${mode}`;

  async function handleCopy() {
    const ok = await copyTreatmentReportText(
      (text) => navigator.clipboard.writeText(text),
      state.text,
    );

    setState((current) => applyTreatmentReportCopyFeedback(current, ok));
  }

  function markDraftAsUnsaved() {
    setSaveStatus("idle");
    setSavedReportId(null);
    setSaveFeedback(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveTreatmentEvolutionReportAction({
        patientId,
        episodeId,
        mode,
        reportType,
        finalText: state.text,
      });

      setSaveFeedback({
        tone: result.ok ? "success" : "error",
        text: result.message ?? (result.ok ? "Informe guardado." : "No se pudo guardar el informe."),
      });

      if (result.ok) {
        setSaveStatus("saved");
        setSavedReportId(result.reportId ?? null);
      }
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Texto final editable</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Texto derivado a partir de datos registrados del tratamiento. Revisalo antes de copiarlo o guardarlo. El informe guardado queda como foto del momento y no reemplaza el contexto clinico vigente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
            saveStatus === "saved"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-slate-300 bg-white text-slate-700"
          }`}
          >
            {saveStatus === "saved" ? "Guardado" : "No guardado"}
          </span>
          <button
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => {
              setState((current) => resetGeneratedTreatmentReportText(current));
              markDraftAsUnsaved();
            }}
            type="button"
          >
            Regenerar desde datos
          </button>
          <button
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={handleCopy}
            type="button"
          >
            Copiar
          </button>
        </div>
      </div>

      <div className="mt-4 rounded border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700" htmlFor={`report-type-${mode}`}>
              Tipo de informe a guardar
            </label>
            <select
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              id={`report-type-${mode}`}
              onChange={(event) => {
                setReportType(event.target.value as TreatmentEvolutionReportType);
                markDraftAsUnsaved();
              }}
              value={reportType}
            >
              <option value="progress">{TREATMENT_EVOLUTION_REPORT_TYPE_LABELS.progress}</option>
              <option value="stage_closure">{TREATMENT_EVOLUTION_REPORT_TYPE_LABELS.stage_closure}</option>
            </select>
          </div>

          <button
            className="rounded bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            disabled={isPending || state.text.trim().length === 0}
            onClick={handleSave}
            type="button"
          >
            {isPending ? "Guardando..." : "Guardar informe"}
          </button>

          {savedReportId ? (
            <Link
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              href={`/admin/patients/${patientId}/encounters`}
            >
              Ir a Gestión clínica
            </Link>
          ) : null}
        </div>
      </div>

      <div className={`mt-4 rounded border px-3 py-2 text-xs ${presentation.className}`}>
        <p className="font-semibold">{presentation.label}</p>
        <p className="mt-0.5">{presentation.description}</p>
      </div>

      {report.warnings.length > 0 ? (
        <div className="mt-3 rounded border border-amber-200 bg-white p-3 text-xs text-amber-900">
          <p className="font-semibold">Datos a revisar</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {report.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4">
        <label className="block text-xs font-medium text-slate-700" htmlFor={textareaId}>
          Texto editable del informe
        </label>
        <textarea
          className={TREATMENT_REPORT_TEXTAREA_CLASS}
          id={textareaId}
          onChange={(event) => setState((current) => editTreatmentReportText(current, event.target.value))}
          onInput={markDraftAsUnsaved}
          value={state.text}
        />
      </div>

      {state.isEdited ? (
        <p className="mt-2 text-xs text-slate-600">
          Editaste el texto localmente. Regenerar desde datos reemplaza estas ediciones por el texto derivado actual.
        </p>
      ) : null}

      {state.feedback ? (
        <p className={`mt-2 text-xs ${state.feedback.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {state.feedback.text}
        </p>
      ) : null}

      {saveFeedback ? (
        <p className={`mt-2 text-xs ${saveFeedback.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {saveFeedback.text}
        </p>
      ) : null}
    </section>
  );
}
