"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { updateEncounterOccurrenceAction } from "@/app/admin/patients/[id]/encounters/actions/update-encounter-occurrence.action";
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
} from "@/lib/patient-admin-display";

interface EncountersListProps {
  patientId: string;
  encounters: Encounter[];
  hasActiveTreatment: boolean;
}

function formatOccurrenceDate(value: string): string {
  return formatDateTimeDisplay(value);
}

export function EncountersList({ patientId, encounters, hasActiveTreatment }: EncountersListProps) {
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

  function saveOccurrenceDate(encounterId: string) {
    if (!canSubmitEncounterInlineEdit({ isPending, draftOccurrenceDate: inlineEditState.draftOccurrenceDate })) {
      return;
    }

    startTransition(async () => {
      const result = await updateEncounterOccurrenceAction({
        encounterId,
        patientId,
        occurrenceDate: inlineEditState.draftOccurrenceDate,
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
            : "Iniciá un tratamiento para poder registrar visitas."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {encounters.map((encounter) => {
            const isEditing = inlineEditState.editingEncounterId === encounter.id;

            return (
              <li key={encounter.id} className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-800">
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700" htmlFor={`encounter-date-${encounter.id}`}>
                      Fecha y hora
                    </label>
                    <input
                      className="w-full rounded border border-slate-300 bg-white p-2"
                      id={`encounter-date-${encounter.id}`}
                      name="occurrenceDate"
                      onChange={(event) =>
                        setInlineEditState((previous) =>
                          changeEncounterInlineDraft(previous, event.target.value),
                        )
                      }
                      required
                      type="datetime-local"
                      value={inlineEditState.draftOccurrenceDate}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                        disabled={!canSubmitEncounterInlineEdit({
                          isPending,
                          draftOccurrenceDate: inlineEditState.draftOccurrenceDate,
                        })}
                        onClick={() => saveOccurrenceDate(encounter.id)}
                        type="button"
                      >
                        {isPending ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
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
                      <p className="font-medium">{formatOccurrenceDate(encounter.occurrenceDate)}</p>
                      <p className="mt-1 text-xs text-slate-600">Estado: {formatEncounterStatusLabel(encounter.status)}</p>
                    </div>
                    <button
                      aria-label="Editar fecha y hora"
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      disabled={isPending}
                      onClick={() => handleStartEditing(encounter)}
                      type="button"
                    >
                      ✏️
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
