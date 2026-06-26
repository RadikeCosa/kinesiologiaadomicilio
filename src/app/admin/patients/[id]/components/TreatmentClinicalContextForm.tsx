"use client";

import { FormEvent, useState, useTransition } from "react";

import { updateTreatmentClinicalContextFieldAction } from "@/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action";
import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

type FieldKey = "medicalReferenceDiagnosis" | "kinesiologicDiagnosis" | "initialFunctionalStatus" | "therapeuticGoals" | "frameworkPlan";
type Tone = "success" | "error";

export function TreatmentClinicalContextForm({ patientId, episodeOfCareId, initialData }: { patientId: string; episodeOfCareId: string; initialData: EpisodeClinicalContextReadModel | null }) {
  const [isPending, startTransition] = useTransition();
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [messages, setMessages] = useState<Partial<Record<FieldKey, { text: string; tone: Tone }>>>({});
  const [medicalReferenceDiagnosisText, setMedical] = useState(initialData?.medicalReferenceDiagnosisText ?? "");
  const [kinesiologicDiagnosisText, setKinesiologic] = useState(initialData?.kinesiologicDiagnosisText ?? "");
  const [initialFunctionalStatus, setInitial] = useState(initialData?.initialFunctionalStatus ?? "");
  const [therapeuticGoals, setGoals] = useState(initialData?.therapeuticGoals ?? "");
  const [frameworkPlan, setPlan] = useState(initialData?.frameworkPlan ?? "");

  function submitField(field: FieldKey, value: string) {
    startTransition(async () => {
      const result = await updateTreatmentClinicalContextFieldAction({ patientId, episodeOfCareId, field, value });
      setMessages((prev) => ({ ...prev, [field]: { text: result.message ?? (result.ok ? "Guardado." : "Error al guardar."), tone: result.ok ? "success" : "error" } }));
      if (result.ok) setEditingField(null);
    });
  }

  function fieldForm(field: FieldKey, label: string, value: string, onChange: (value: string) => void) {
    const hasValue = Boolean(value.trim());
    const isEditing = editingField === field;
    return <>
      <p className="mt-2 text-sm text-slate-700">{hasValue ? value : "No registrado"}</p>
      {messages[field] ? <p className={`mt-2 text-sm ${messages[field]?.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>{messages[field]?.text}</p> : null}
      {isEditing ? (
        <form className="mt-2" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); submitField(field, value); }}>
          <label className="sr-only" htmlFor={field}>{label}</label>
          <textarea className="mt-1 w-full rounded border p-2 text-sm" id={field} placeholder={label} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white" disabled={isPending} type="submit">{isPending ? "Guardando..." : "Guardar"}</button>
            <button className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => setEditingField(null)} type="button">Cancelar</button>
          </div>
        </form>
      ) : (
        <button className="mt-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setEditingField(field)} type="button">
          {hasValue ? `Editar ${label.toLowerCase()}` : `Agregar ${label.toLowerCase()}`}
        </button>
      )}
    </>;
  }

  return <section className="mt-5 rounded-xl border border-slate-300 bg-slate-100/70 p-6"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto clínico del ciclo</h2><p className="mt-2 text-xs text-slate-600">Cada campo se guarda de forma independiente y no modifica los demás.</p>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Diagnóstico médico de referencia</h3>
      <p className="mt-1 text-xs text-slate-500">Usalo para dejar el diagnóstico de referencia con el que llega o fue orientado el tratamiento. No hace falta resumir toda la evolución acá.</p>
      {fieldForm("medicalReferenceDiagnosis", "Diagnóstico médico de referencia", medicalReferenceDiagnosisText, setMedical)}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Diagnóstico kinésico</h3>
      <p className="mt-1 text-xs text-slate-500">Describí la interpretación kinésica actual del problema funcional que organiza este ciclo.</p>
      {fieldForm("kinesiologicDiagnosis", "Diagnóstico kinésico", kinesiologicDiagnosisText, setKinesiologic)}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Situación funcional inicial</h3>
      <p className="mt-1 text-xs text-slate-500">Tomalo como basal del ciclo: cómo estaba la persona al inicio en movilidad, dolor, tolerancia, marcha o actividades relevantes. Evitá usarlo para evolución puntual de una visita.</p>
      {fieldForm("initialFunctionalStatus", "Situación funcional inicial", initialFunctionalStatus, setInitial)}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Objetivos terapéuticos</h3>
      <p className="mt-1 text-xs text-slate-500">Redactalos como metas observables o verificables del ciclo, no solo como intención general.</p>
      {fieldForm("therapeuticGoals", "Objetivo de tratamiento", therapeuticGoals, setGoals)}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Plan marco del tratamiento</h3>
      <p className="mt-1 text-xs text-slate-500">Usalo para la estrategia longitudinal del tratamiento: enfoque, frecuencia orientativa, progresión esperada o ejes de trabajo. No hace falta repetir lo hecho en cada visita.</p>
      {fieldForm("frameworkPlan", "Plan marco del tratamiento", frameworkPlan, setPlan)}
    </section>
  </section>;
}
