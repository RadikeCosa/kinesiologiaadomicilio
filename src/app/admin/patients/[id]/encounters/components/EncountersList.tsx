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

  if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp) || endTimestamp < startTimestamp) {
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
            ? "Todavía no hay visitas. Registrá la primera."
            : hasFinishedTreatment
              ? "No hay visitas registradas en este tratamiento."
              : "No hay visitas registradas por el momento."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {encounters.map((encounter) => {
            const isEditing = inlineEditState.editingEncounterId === encounter.id;
            const durationLabel = getDurationLabel(encounter.startedAt, encounter.endedAt);

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
                    <div>
                      <p className="font-medium">{formatOccurrenceDate(encounter.startedAt)}</p>
                      {encounter.endedAt ? (
                        <p className="mt-1 text-xs text-slate-600">
                          Finalización: {formatTimeDisplay(encounter.endedAt)}
                        </p>
                      ) : null}
                      {durationLabel ? (
                        <p className="mt-1 text-xs text-slate-600">
                          Duración: {durationLabel}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-600">Estado: {formatEncounterStatusLabel(encounter.status)}</p>
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
