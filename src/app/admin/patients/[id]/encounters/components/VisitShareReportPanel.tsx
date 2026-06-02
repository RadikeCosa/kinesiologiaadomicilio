"use client";

import React, { useState, useTransition } from "react";

import { loadVisitShareReportAction } from "@/app/admin/patients/[id]/encounters/actions/load-visit-share-report.action";
import type {
  VisitShareReportCompositionResult,
  VisitShareReportCompletenessStatus,
  VisitShareReportRecipientKind,
} from "@/features/visit-share-report/visit-share-report.types";
import {
  buildVisitShareReportWhatsAppUrl,
  findVisitShareReportWhatsAppRecipient,
  getAvailableVisitShareReportWhatsAppRecipients,
  selectDefaultVisitShareReportWhatsAppRecipient,
  type VisitShareReportWhatsAppRecipient,
} from "@/features/visit-share-report/visit-share-report.whatsapp";

import {
  applyVisitShareReportCopyFeedback,
  createInitialVisitShareReportPanelState,
  copyVisitShareReportText,
  editVisitShareReportText,
  loadGeneratedVisitShareReportText,
} from "./visit-share-report-panel.state";

interface VisitShareReportPanelProps {
  patientId: string;
  encounterId: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const COMPLETENESS_COPY: Record<VisitShareReportCompletenessStatus, {
  label: string;
  description: string;
  className: string;
}> = {
  ready: {
    label: "Listo",
    description: "El resumen tiene datos suficientes para revisar y copiar.",
    className: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  usable_with_warnings: {
    label: "Revisar",
    description: "El resumen puede usarse, pero faltan algunos datos. Revisalo antes de compartir.",
    className: "border-amber-300 bg-amber-50 text-amber-900",
  },
  insufficient: {
    label: "Insuficiente",
    description: "Faltan datos clínicos para armar un resumen útil.",
    className: "border-red-300 bg-red-50 text-red-900",
  },
};

function getReportTextareaId(encounterId: string): string {
  return `visit-share-report-text-${encounterId}`;
}

export const VISIT_SHARE_REPORT_TEXTAREA_CLASS = "mt-1 max-h-[70vh] min-h-[28rem] w-full resize-y rounded border border-slate-300 bg-white p-3 text-sm text-slate-800";

function getRecipientDisplayLabel(recipient: VisitShareReportWhatsAppRecipient): string {
  if (recipient.kind === "patient") {
    return `Paciente: ${recipient.displayName}`;
  }

  return `Contacto principal: ${recipient.displayName}${recipient.relationshipLabel ? ` (${recipient.relationshipLabel})` : ""}`;
}

export function VisitShareReportPanel({
  patientId,
  encounterId,
  isOpen,
  onOpen,
  onClose,
}: VisitShareReportPanelProps) {
  const [report, setReport] = useState<VisitShareReportCompositionResult | null>(null);
  const [recipients, setRecipients] = useState<VisitShareReportWhatsAppRecipient[]>([]);
  const [selectedRecipientKind, setSelectedRecipientKind] = useState<VisitShareReportRecipientKind | null>(null);
  const [state, setState] = useState(createInitialVisitShareReportPanelState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const presentation = report ? COMPLETENESS_COPY[report.completeness.status] : null;
  const selectedRecipient = selectedRecipientKind
    ? findVisitShareReportWhatsAppRecipient(recipients, selectedRecipientKind)
    : null;

  function loadReport() {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await loadVisitShareReportAction({ patientId, encounterId });

      if (!result.ok || !result.report) {
        setErrorMessage(result.message ?? "No se pudo preparar el resumen compartible.");
        return;
      }

      const loadedReport = result.report;
      const availableRecipients = getAvailableVisitShareReportWhatsAppRecipients(result.recipients ?? []);
      const defaultRecipient = selectDefaultVisitShareReportWhatsAppRecipient(availableRecipients);

      setReport(loadedReport);
      setRecipients(availableRecipients);
      setSelectedRecipientKind(defaultRecipient?.kind ?? null);
      setState((current) => loadGeneratedVisitShareReportText(current, loadedReport.initialText));
    });
  }

  function handleOpen() {
    onOpen();
    loadReport();
  }

  function handleRegenerate() {
    loadReport();
  }

  async function handleCopy() {
    const ok = await copyVisitShareReportText(
      (text) => navigator.clipboard.writeText(text),
      state.text,
    );
    setState((current) => applyVisitShareReportCopyFeedback(current, ok));
  }

  function handleOpenWhatsApp() {
    const href = buildVisitShareReportWhatsAppUrl(selectedRecipient, state.text);

    if (!href) {
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
  }

  if (!isOpen) {
    return (
      <button
        className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        onClick={handleOpen}
        type="button"
      >
        Resumen para compartir
      </button>
    );
  }

  return (
    <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Resumen compartible de visita</h3>
          <p className="mt-1 max-w-2xl text-xs text-slate-600">
            Texto generado a partir de datos registrados. Revisalo antes de copiarlo o compartirlo. No reemplaza la nota clínica interna.
          </p>
        </div>
        <button
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          disabled={isPending}
          onClick={onClose}
          type="button"
        >
          Cerrar
        </button>
      </div>

      {isPending && !report ? (
        <p className="mt-3 rounded border border-slate-200 bg-white p-2 text-xs text-slate-600">
          Preparando resumen...
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {errorMessage}
        </p>
      ) : null}

      {report && presentation ? (
        <div className="mt-3 space-y-3">
          <div className={`rounded border px-3 py-2 text-xs ${presentation.className}`}>
            <p className="font-semibold">{presentation.label}</p>
            <p className="mt-0.5">{presentation.description}</p>
          </div>

          {report.warnings.length > 0 ? (
            <div className="rounded border border-amber-200 bg-white p-2 text-xs text-amber-900">
              <p className="font-semibold">Datos a revisar</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {report.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-medium text-slate-700" htmlFor={getReportTextareaId(encounterId)}>
              Texto editable del resumen
            </label>
            <textarea
              className={VISIT_SHARE_REPORT_TEXTAREA_CLASS}
              id={getReportTextareaId(encounterId)}
              onChange={(event) => {
                setState((current) => editVisitShareReportText(current, event.target.value));
              }}
              value={state.text}
            />
          </div>

          {state.isEdited ? (
            <p className="text-xs text-slate-600">
              Editaste el texto localmente. Regenerar desde datos reemplaza estas ediciones por el resumen basado en datos persistidos.
            </p>
          ) : null}

          {state.feedback ? (
            <p className={`text-xs ${state.feedback.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
              {state.feedback.text}
            </p>
          ) : null}

          <div className="rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">WhatsApp prellenado</p>
            {recipients.length > 0 ? (
              <>
                <p className="mt-1 text-slate-600">
                  Revisá el texto antes de compartirlo. WhatsApp abrirá el mensaje prellenado, pero el envío final depende de vos.
                </p>
                {recipients.length > 1 ? (
                  <fieldset className="mt-2 space-y-1">
                    <legend className="font-medium text-slate-700">Destinatario</legend>
                    {recipients.map((recipient) => (
                      <label className="flex items-center gap-2" key={recipient.kind}>
                        <input
                          checked={selectedRecipientKind === recipient.kind}
                          name={`visit-share-report-recipient-${encounterId}`}
                          onChange={() => setSelectedRecipientKind(recipient.kind)}
                          type="radio"
                          value={recipient.kind}
                        />
                        <span>{getRecipientDisplayLabel(recipient)}</span>
                      </label>
                    ))}
                  </fieldset>
                ) : selectedRecipient ? (
                  <p className="mt-2 text-slate-700">
                    Destinatario: {getRecipientDisplayLabel(selectedRecipient)}
                  </p>
                ) : null}
                {selectedRecipient?.kind === "main_contact" ? (
                  <p className="mt-2 text-amber-800">
                    El mensaje se abrirá para el contacto principal, no para el teléfono del paciente.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-1 text-slate-600">
                No hay teléfono operativo para WhatsApp. Podés copiar el texto y compartirlo manualmente por otro canal.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              disabled={isPending || !state.text.trim()}
              onClick={handleCopy}
              type="button"
            >
              Copiar texto
            </button>
            {recipients.length > 0 ? (
              <button
                className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
                disabled={isPending || !selectedRecipient || !state.text.trim()}
                onClick={handleOpenWhatsApp}
                type="button"
              >
                Abrir WhatsApp
              </button>
            ) : null}
            <button
              className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={isPending}
              onClick={handleRegenerate}
              type="button"
            >
              {isPending ? "Regenerando..." : "Regenerar desde datos"}
            </button>
            <button
              className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              disabled={isPending}
              onClick={onClose}
              type="button"
            >
              Descartar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
