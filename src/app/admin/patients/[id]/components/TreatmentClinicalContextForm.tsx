"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateTreatmentClinicalContextFieldAction } from "@/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action";
import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

type FieldKey = "initialFunctionalStatus" | "medicalReferenceDiagnosis" | "kinesiologicDiagnosis" | "therapeuticGoals" | "frameworkPlan";
type Tone = "success" | "error";

interface FieldConfig {
  key: FieldKey;
  label: string;
  placeholder: string;
  rows?: number;
}

type FormValues = Record<FieldKey, string>;

const FIELD_CONFIG: FieldConfig[] = [
  {
    key: "initialFunctionalStatus",
    label: "Situación funcional inicial",
    placeholder: "Cómo estaba la persona al comenzar este tratamiento.",
    rows: 4,
  },
  {
    key: "medicalReferenceDiagnosis",
    label: "Diagnóstico médico de referencia",
    placeholder: "Diagnóstico o marco clínico con el que llega o fue derivado este tratamiento.",
  },
  {
    key: "kinesiologicDiagnosis",
    label: "Diagnóstico kinésico actual",
    placeholder: "Problema funcional que organiza este tratamiento desde la mirada kinésica.",
  },
  {
    key: "therapeuticGoals",
    label: "Objetivos del tratamiento",
    placeholder: "Metas observables o verificables del ciclo.",
  },
  {
    key: "frameworkPlan",
    label: "Plan general del tratamiento",
    placeholder: "Estrategia general, frecuencia orientativa y ejes de trabajo.",
    rows: 4,
  },
];

export function buildFormValues(initialData: EpisodeClinicalContextReadModel | null): FormValues {
  return {
    initialFunctionalStatus: initialData?.initialFunctionalStatus ?? "",
    medicalReferenceDiagnosis: initialData?.medicalReferenceDiagnosisText ?? "",
    kinesiologicDiagnosis: initialData?.kinesiologicDiagnosisText ?? "",
    therapeuticGoals: initialData?.therapeuticGoals ?? "",
    frameworkPlan: initialData?.frameworkPlan ?? "",
  };
}

function normalizeText(value: string): string {
  return value.trim();
}

export function normalizeFormValues(values: FormValues): FormValues {
  return {
    initialFunctionalStatus: normalizeText(values.initialFunctionalStatus),
    medicalReferenceDiagnosis: normalizeText(values.medicalReferenceDiagnosis),
    kinesiologicDiagnosis: normalizeText(values.kinesiologicDiagnosis),
    therapeuticGoals: normalizeText(values.therapeuticGoals),
    frameworkPlan: normalizeText(values.frameworkPlan),
  };
}

export function getChangedFieldKeys(persistedValues: FormValues, draftValues: FormValues): FieldKey[] {
  const normalizedDraftValues = normalizeFormValues(draftValues);

  return FIELD_CONFIG
    .filter(({ key }) => normalizeText(persistedValues[key]) !== normalizedDraftValues[key])
    .map(({ key }) => key);
}

export function resetDraftValues(persistedValues: FormValues): FormValues {
  return { ...persistedValues };
}

export function TreatmentClinicalContextForm({
  patientId,
  episodeOfCareId,
  initialData,
  initialEditing = false,
}: {
  patientId: string;
  episodeOfCareId: string;
  initialData: EpisodeClinicalContextReadModel | null;
  initialEditing?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [message, setMessage] = useState<{ text: string; tone: Tone } | null>(null);
  const [persistedValues, setPersistedValues] = useState<FormValues>(() => buildFormValues(initialData));
  const [draftValues, setDraftValues] = useState<FormValues>(() => buildFormValues(initialData));

  function handleEditStart() {
    setDraftValues(resetDraftValues(persistedValues));
    setMessage(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraftValues(resetDraftValues(persistedValues));
    setMessage(null);
    setIsEditing(false);
  }

  function handleChange(field: FieldKey, value: string) {
    setDraftValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDraftValues = normalizeFormValues(draftValues);
    const changedFields = getChangedFieldKeys(persistedValues, draftValues);

    if (changedFields.length === 0) {
      setDraftValues(resetDraftValues(persistedValues));
      setMessage({ text: "No había cambios para guardar.", tone: "success" });
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      for (const field of changedFields) {
        const result = await updateTreatmentClinicalContextFieldAction({
          patientId,
          episodeOfCareId,
          field,
          value: draftValues[field],
        });

        if (!result.ok) {
          setMessage({
            text: result.message ?? "No se pudieron guardar los cambios del contexto clínico.",
            tone: "error",
          });
          return;
        }
      }

      setPersistedValues(normalizedDraftValues);
      setDraftValues(normalizedDraftValues);
      setMessage({ text: "Contexto clínico actualizado.", tone: "success" });
      setIsEditing(false);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-slate-300 bg-slate-100/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto general del tratamiento</h2>
          <p className="mt-2 text-sm text-slate-600">
            Este bloque organiza el tratamiento a lo largo del ciclo y no reemplaza el registro de visitas.
          </p>
        </div>
        {!isEditing ? (
          <button
            className="inline-flex items-center justify-center rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={handleEditStart}
            type="button"
          >
            Editar contexto clínico
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          {FIELD_CONFIG.map((field, index) => {
            const value = persistedValues[field.key];
            const hasValue = Boolean(value);

            return (
              <section
                className={index > 0 ? "border-t border-slate-200 pt-4" : ""}
                key={field.key}
              >
                <h3 className="text-sm font-medium text-slate-900">{field.label}</h3>
                <p className={`mt-1 whitespace-pre-wrap text-sm leading-6 ${hasValue ? "text-slate-700" : "text-slate-400"}`}>
                  {hasValue ? value : "Sin dato"}
                </p>
              </section>
            );
          })}
        </div>
      ) : (
        <form className="mt-4 rounded-xl border border-slate-200 bg-white p-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {FIELD_CONFIG.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-900" htmlFor={field.key}>
                  {field.label}
                </label>
                <textarea
                  className="mt-1 w-full rounded border border-slate-300 bg-white p-3 text-sm text-slate-800"
                  id={field.key}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 3}
                  value={draftValues[field.key]}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            <button
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              disabled={isPending}
              onClick={handleCancel}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${message.tone === "success" ? "text-emerald-700" : "text-red-700"}`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
