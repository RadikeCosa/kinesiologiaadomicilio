"use client";

import React, { FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateEncounterClinicalNoteAction } from "@/app/admin/patients/[id]/encounters/actions/update-encounter-clinical-note.action";
import type { Encounter, EncounterClinicalNote } from "@/domain/encounter/encounter.types";

interface EncounterClinicalNoteEditorProps {
  patientId: string;
  encounter: Encounter;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const CLINICAL_NOTE_FIELDS: Array<{
  key: keyof EncounterClinicalNote;
  label: string;
  helper: string;
}> = [
  {
    key: "subjective",
    label: "Subjetivo / referido por paciente",
    helper: "Qué refiere el paciente o familia.",
  },
  {
    key: "objective",
    label: "Objetivo / observado",
    helper: "Qué se observa durante la visita.",
  },
  {
    key: "intervention",
    label: "Intervención realizada",
    helper: "Trabajo realizado durante la sesión.",
  },
  {
    key: "assessment",
    label: "Evaluación o respuesta clínica",
    helper: "Respuesta clínica o evolución observada en esta visita.",
  },
  {
    key: "tolerance",
    label: "Tolerancia",
    helper: "Tolerancia del paciente durante la sesión.",
  },
  {
    key: "homeInstructions",
    label: "Indicaciones domiciliarias",
    helper: "Indicaciones para continuar en casa.",
  },
  {
    key: "nextPlan",
    label: "Próximo plan",
    helper: "Plan previsto para la próxima visita.",
  },
];

function hasClinicalNoteContent(clinicalNote: EncounterClinicalNote | undefined): boolean {
  return Object.values(clinicalNote ?? {}).some((value) => Boolean(value?.trim()));
}

export function getEncounterClinicalNoteEditorActionLabel(encounter: Encounter): string {
  return hasClinicalNoteContent(encounter.clinicalNote) ? "Editar nota clínica" : "Completar nota clínica";
}

export function EncounterClinicalNoteEditor({
  patientId,
  encounter,
  isOpen,
  onOpen,
  onClose,
}: EncounterClinicalNoteEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = React.useState<{ text: string; tone: "success" | "error" } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clinicalNote = Object.fromEntries(
      CLINICAL_NOTE_FIELDS.map(({ key }) => [key, String(formData.get(key) ?? "")]),
    );

    startTransition(async () => {
      const result = await updateEncounterClinicalNoteAction({
        patientId,
        encounterId: encounter.id,
        clinicalNote,
      });

      setMessage({
        text: result.message ?? (result.ok ? "Nota clínica actualizada correctamente." : "No se pudo actualizar la nota clínica."),
        tone: result.ok ? "success" : "error",
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        onClick={() => {
          setMessage(null);
          onOpen();
        }}
        type="button"
      >
        {getEncounterClinicalNoteEditorActionLabel(encounter)}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Nota clínica estructurada</h3>
          <p className="mt-1 max-w-2xl text-xs text-slate-600">
            Esta nota es la fuente clínica interna de la visita. Los resúmenes compartibles se generan a partir de estos datos, pero no reemplazan esta nota.
          </p>
          {!hasClinicalNoteContent(encounter.clinicalNote) ? (
            <p className="mt-2 rounded border border-dashed border-slate-300 bg-slate-50 p-2 text-xs text-slate-600">
              Todavía no hay nota clínica registrada para esta visita. Podés completarla sin modificar horario ni métricas.
            </p>
          ) : null}
        </div>
        <button
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          disabled={isPending}
          onClick={() => {
            setMessage(null);
            onClose();
          }}
          type="button"
        >
          Cancelar
        </button>
      </div>

      <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 lg:grid-cols-2">
          {CLINICAL_NOTE_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-700" htmlFor={`clinical-note-${encounter.id}-${field.key}`}>
                {field.label}
              </label>
              <textarea
                className="mt-1 min-h-24 w-full resize-y rounded border border-slate-300 bg-white p-2 text-sm text-slate-800"
                defaultValue={encounter.clinicalNote?.[field.key] ?? ""}
                id={`clinical-note-${encounter.id}-${field.key}`}
                maxLength={2000}
                name={field.key}
              />
              <p className="mt-1 text-[11px] text-slate-500">{field.helper}</p>
            </div>
          ))}
        </div>

        {message ? (
          <p className={`text-xs ${message.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
            {message.text}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Guardando..." : "Guardar nota clínica"}
          </button>
          <button
            className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            disabled={isPending}
            onClick={() => {
              setMessage(null);
              onClose();
            }}
            type="button"
          >
            Cancelar sin guardar
          </button>
        </div>
      </form>
    </div>
  );
}
