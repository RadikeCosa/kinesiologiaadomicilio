"use client";

import { FormEvent, useState, useTransition } from "react";

import { updateTreatmentClinicalContextFieldAction } from "@/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action";
import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

type FieldKey = "medicalReferenceDiagnosis" | "kinesiologicDiagnosis" | "initialFunctionalStatus" | "therapeuticGoals" | "frameworkPlan";
type Tone = "success" | "error";

export function TreatmentClinicalContextForm({ patientId, episodeOfCareId, initialData }: { patientId: string; episodeOfCareId: string; initialData: EpisodeClinicalContextReadModel | null }) {
  const [isPending, startTransition] = useTransition();
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
    });
  }

  function fieldForm(field: FieldKey, label: string, value: string, onChange: (value: string) => void, button: string) {
    return <form className="mt-2" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); submitField(field, value); }}>
      <label className="block text-sm text-slate-700">
        {label}
        <textarea className="mt-1 w-full rounded border p-2 text-sm" placeholder={label} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
      {messages[field] ? <p className={`mt-2 text-sm ${messages[field]?.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>{messages[field]?.text}</p> : null}
      <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white" disabled={isPending} type="submit">{isPending ? "Guardando..." : button}</button>
    </form>;
  }

  return <section className="mt-5 rounded-xl border border-slate-300 bg-slate-100/70 p-6"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto clínico del ciclo</h2><p className="mt-2 text-xs text-slate-600">Cada campo se guarda de forma independiente y no modifica los demás.</p>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Diagnóstico médico de referencia</h3>
      {fieldForm("medicalReferenceDiagnosis", "Diagnóstico médico de referencia", medicalReferenceDiagnosisText, setMedical, "Guardar diagnóstico médico")}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Diagnóstico kinésico</h3>
      {fieldForm("kinesiologicDiagnosis", "Diagnóstico kinésico", kinesiologicDiagnosisText, setKinesiologic, "Guardar diagnóstico kinésico")}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Situación funcional inicial</h3>
      {fieldForm("initialFunctionalStatus", "Situación funcional inicial", initialFunctionalStatus, setInitial, "Guardar situación funcional")}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Objetivo de tratamiento</h3>
      {fieldForm("therapeuticGoals", "Objetivo de tratamiento", therapeuticGoals, setGoals, "Guardar objetivo")}
    </section>
    <section className="rounded-lg border border-slate-200 bg-white p-4 mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Plan marco del tratamiento</h3>
      {fieldForm("frameworkPlan", "Plan marco del tratamiento", frameworkPlan, setPlan, "Guardar plan marco")}
    </section>
  </section>;
}
