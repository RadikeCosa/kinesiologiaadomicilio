"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { updateEncounterPeriodAction } from "@/app/admin/patients/[id]/encounters/actions/update-encounter-period.action";
import {
  getNextEndedAtOnStartChange,
  isEncounterEndBeforeStart,
} from "@/app/admin/patients/[id]/encounters/components/EncounterCreateForm";
import {
  canSubmitEncounterInlineEdit,
  cancelEncounterInlineEdit,
  changeEncounterInlineDraft,
  createInitialEncountersInlineEditState,
  startEncounterInlineEdit,
} from "@/app/admin/patients/[id]/encounters/components/encounters-inline-edit.state";
import type { Encounter } from "@/domain/encounter/encounter.types";
import { ENCOUNTER_OPERATIONAL_PUNCTUALITY_LABEL } from "@/infrastructure/mappers/encounter/encounter-operational-punctuality.constants";
import {
  formatDateTimeDisplay,
  formatEncounterStatusLabel,
  formatTimeDisplay,
} from "@/lib/patient-admin-display";

interface EncountersListProps {
  patientId: string;
  encounters: Encounter[];
  hasActiveTreatment: boolean;
  hasFinishedTreatment: boolean;
}

function formatOccurrenceDate(value: string): string {
  return formatDateTimeDisplay(value);
}

function getDurationLabel(startedAt?: string, endedAt?: string): string | null {
  if (!startedAt || !endedAt) {
    return null;
  }

  const startTimestamp = new Date(startedAt).getTime();
  const endTimestamp = new Date(endedAt).getTime();

  if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp) || endTimestamp <= startTimestamp) {
    return null;
  }

  const durationMinutes = Math.round((endTimestamp - startTimestamp) / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

const CLINICAL_NOTE_LABELS: Array<{ key: keyof NonNullable<Encounter["clinicalNote"]>; label: string }> = [
  { key: "subjective", label: "Refiere" },
  { key: "objective", label: "Se observa" },
  { key: "intervention", label: "Se trabajó" },
  { key: "assessment", label: "Evolución" },
  { key: "tolerance", label: "Tolerancia" },
  { key: "homeInstructions", label: "Indicaciones" },
  { key: "nextPlan", label: "Próximo plan" },
];
const CLINICAL_NOTE_PREVIEW_MAX_CHARS = 180;
const FUNCTIONAL_LABELS = {
  tug_seconds: "TUG",
  pain_nrs_0_10: "Dolor",
  standing_tolerance_minutes: "Bipedestación",
} as const;
const FUNCTIONAL_OBSERVATION_ORDER: Array<keyof typeof FUNCTIONAL_LABELS> = [
  "tug_seconds",
  "pain_nrs_0_10",
  "standing_tolerance_minutes",
];

function toCompactClinicalValue(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= CLINICAL_NOTE_PREVIEW_MAX_CHARS) {
    return normalized;
  }

  return `${normalized.slice(0, CLINICAL_NOTE_PREVIEW_MAX_CHARS).trimEnd()}…`;
}

export function EncountersList({
  patientId,
  encounters,
  hasActiveTreatment,
  hasFinishedTreatment,
}: EncountersListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { message, setMessage, clearMessage } = useFormFeedback();
  const [inlineEditState, setInlineEditState] = useState(createInitialEncountersInlineEditState);
  const [expandedClinicalEncounterIds, setExpandedClinicalEncounterIds] = useState<Record<string, boolean>>({});

  function handleStartEditing(encounter: Encounter) {
    setInlineEditState(startEncounterInlineEdit(encounter));
    clearMessage();
  }

  function handleCancelEditing(encounter: Encounter) {
    setInlineEditState(cancelEncounterInlineEdit(encounter));
    clearMessage();
  }

  function saveEncounterPeriod(encounterId: string) {
    if (!canSubmitEncounterInlineEdit({
      isPending,
      draftStartedAt: inlineEditState.draftStartedAt,
      draftEndedAt: inlineEditState.draftEndedAt,
    })) {
      return;
    }

    if (isEncounterEndBeforeStart(inlineEditState.draftStartedAt, inlineEditState.draftEndedAt)) {
      setMessage({
        text: "El cierre debe ser igual o posterior al inicio.",
        tone: "error",
      });
      return;
    }

    startTransition(async () => {
      const result = await updateEncounterPeriodAction({
        encounterId,
        patientId,
        startedAt: inlineEditState.draftStartedAt,
        endedAt: inlineEditState.draftEndedAt,
      });

      setMessage({
        text: result.message ?? (result.ok ? "Visita actualizada correctamente." : "No se pudo actualizar la visita."),
        tone: result.ok ? "success" : "error",
      });

      if (result.ok) {
        setInlineEditState(createInitialEncountersInlineEditState());
        router.refresh();
      }
    });
  }
  function toggleClinicalDetails(encounterId: string) {
    setExpandedClinicalEncounterIds((previous) => ({
      ...previous,
      [encounterId]: !previous[encounterId],
    }));
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Visitas registradas</h2>

      {message ? (
        <p className={`mt-3 text-sm ${message.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {message.text}
        </p>
      ) : null}

      {encounters.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">
          {hasActiveTreatment
            ? "Todavía no hay visitas registradas para este tratamiento."
            : hasFinishedTreatment
              ? "Tratamiento finalizado. Las visitas quedan disponibles como historial."
              : "No hay visitas registradas por el momento."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {encounters.map((encounter) => {
            const isEditing = inlineEditState.editingEncounterId === encounter.id;
            const durationLabel = getDurationLabel(encounter.startedAt, encounter.endedAt);
            const clinicalEntries = CLINICAL_NOTE_LABELS
              .map(({ key, label }) => ({ label, value: encounter.clinicalNote?.[key] }))
              .filter((entry) => Boolean(entry.value));
            const hasLongClinicalNote = clinicalEntries.some((entry) =>
              (entry.value ?? "").replace(/\s+/g, " ").trim().length > CLINICAL_NOTE_PREVIEW_MAX_CHARS,
            );
            const isClinicalExpanded = expandedClinicalEncounterIds[encounter.id] ?? false;
            const functionalObservations = encounter.functionalObservations ?? [];
            const punctualityLabel = encounter.visitStartPunctuality
              ? ENCOUNTER_OPERATIONAL_PUNCTUALITY_LABEL[encounter.visitStartPunctuality]
              : null;
            const orderedFunctionalObservations = FUNCTIONAL_OBSERVATION_ORDER
              .map((code) => functionalObservations.find((metric) => metric.code === code))
              .filter((metric): metric is NonNullable<typeof metric> => Boolean(metric));

            return (
              <li key={encounter.id} className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-800">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium" htmlFor={`encounter-date-${encounter.id}`}>
                          Inicio de la visita
                        </label>
                        <input
                          className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
                          id={`encounter-date-${encounter.id}`}
                          name="startedAt"
                          onChange={(event) =>
                            setInlineEditState((previous) =>
                              changeEncounterInlineDraft(previous, {
                                startedAt: event.target.value,
                                endedAt: getNextEndedAtOnStartChange({
                                  nextStartedAt: event.target.value,
                                  currentEndedAt: previous.draftEndedAt,
                                  hasUserEditedEndedAt: previous.hasUserEditedEndedAt,
                                }),
                              }),
                            )
                          }
                          required
                          type="datetime-local"
                          value={inlineEditState.draftStartedAt}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium" htmlFor={`encounter-end-date-${encounter.id}`}>
                          Cierre de la visita
                        </label>
                        <input
                          className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
                          id={`encounter-end-date-${encounter.id}`}
                          min={inlineEditState.draftStartedAt || undefined}
                          name="endedAt"
                          onChange={(event) =>
                            setInlineEditState((previous) =>
                              changeEncounterInlineDraft(previous, {
                                endedAt: event.target.value,
                                hasUserEditedEndedAt: true,
                              }),
                            )
                          }
                          required
                          type="datetime-local"
                          value={inlineEditState.draftEndedAt}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">Completá inicio y cierre para actualizar la visita registrada.</p>

                    {isEncounterEndBeforeStart(inlineEditState.draftStartedAt, inlineEditState.draftEndedAt) ? (
                      <p className="text-sm text-red-700">El cierre debe ser igual o posterior al inicio.</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                        disabled={!canSubmitEncounterInlineEdit({
                          isPending,
                          draftStartedAt: inlineEditState.draftStartedAt,
                          draftEndedAt: inlineEditState.draftEndedAt,
                        })}
                        onClick={() => saveEncounterPeriod(encounter.id)}
                        type="button"
                      >
                        {isPending ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        disabled={isPending}
                        onClick={() => handleCancelEditing(encounter)}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">Fecha: {formatOccurrenceDate(encounter.startedAt)}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span>Inicio: {formatTimeDisplay(encounter.startedAt)}</span>
                        {encounter.endedAt
                          ? <span>Cierre: {formatTimeDisplay(encounter.endedAt)}</span>
                          : <span>Cierre: Sin cierre registrado</span>}
                        {durationLabel ? <span>Duración: {durationLabel}</span> : <span>Duración: No calculable</span>}
                        <span>Estado: {formatEncounterStatusLabel(encounter.status)}</span>
                        {punctualityLabel ? <span>Puntualidad: {punctualityLabel}</span> : null}
                      </div>
                      {clinicalEntries.length > 0 ? (
                        <div className="mt-2 rounded border border-slate-100 bg-slate-50 p-2">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Registro clínico</p>
                          <ul className="mt-1 space-y-1 text-xs text-slate-700">
                            {clinicalEntries.map((entry) => (
                              <li key={entry.label}>
                                <span className="font-medium">{entry.label}:</span>{" "}
                                {isClinicalExpanded ? entry.value : toCompactClinicalValue(entry.value ?? "")}
                              </li>
                            ))}
                          </ul>
                          {hasLongClinicalNote ? (
                            <button
                              className="mt-2 text-xs font-medium text-slate-700 underline-offset-2 hover:underline"
                              onClick={() => toggleClinicalDetails(encounter.id)}
                              type="button"
                            >
                              {isClinicalExpanded ? "Ocultar detalle clínico" : "Ver detalle clínico"}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                      {orderedFunctionalObservations.length > 0 ? (
                        <div className="mt-2 rounded border border-slate-100 bg-slate-50 p-2">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Métricas funcionales</p>
                          <p className="mt-1 text-xs text-slate-600">Valores registrados en esta visita. No representan tendencia.</p>
                          <ul className="mt-1 space-y-1 text-xs text-slate-700">
                            {orderedFunctionalObservations.map((metric) => (
                              <li key={`${encounter.id}-${metric.code}`}>
                                <span className="font-medium">{FUNCTIONAL_LABELS[metric.code]}:</span>{" "}
                                {metric.code === "pain_nrs_0_10" ? `${metric.value}/10` : metric.code === "tug_seconds" ? `${metric.value} s` : `${metric.value} min`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                    <button
                      aria-label="Editar horario"
                      className="inline-flex items-center justify-center rounded border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => handleStartEditing(encounter)}
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 17.25V21h3.75L18.81 8.94l-3.75-3.75L3 17.25Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M14.96 5.04 18.71 8.79"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
