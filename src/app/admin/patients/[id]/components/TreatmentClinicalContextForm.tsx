"use client";

import { FormEvent, useState, useTransition } from "react";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { upsertEpisodeClinicalContextAction } from "@/app/admin/patients/[id]/actions/upsert-episode-clinical-context.action";
import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

type FieldKey = "medicalReferenceDiagnosisText" | "kinesiologicImpressionText" | "initialFunctionalStatus" | "therapeuticGoals" | "frameworkPlan";

export function TreatmentClinicalContextForm({ patientId, episodeOfCareId, initialData }: { patientId: string; episodeOfCareId: string; initialData: EpisodeClinicalContextReadModel | null }) {
  const [isPending, startTransition] = useTransition();
  const { message, setMessage } = useFormFeedback();
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [medicalReferenceDiagnosisText, setMedical] = useState(initialData?.medicalReferenceDiagnosisText ?? "");
  const [kinesiologicImpressionText, setKinesiologic] = useState(initialData?.kinesiologicImpressionText ?? "");
  const [initialFunctionalStatus, setInitial] = useState(initialData?.initialFunctionalStatus ?? "");
  const [therapeuticGoals, setGoals] = useState(initialData?.therapeuticGoals ?? "");
  const [frameworkPlan, setPlan] = useState(initialData?.frameworkPlan ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await upsertEpisodeClinicalContextAction({ patientId, episodeOfCareId, medicalReferenceDiagnosisText, kinesiologicImpressionText, initialFunctionalStatus, therapeuticGoals, frameworkPlan });
      setMessage({ text: result.message ?? (result.ok ? "Guardado." : "Error al guardar."), tone: result.ok ? "success" : "error" });
      if (result.ok) setActiveField(null);
    });
  }

  const fields = [
    { key: "medicalReferenceDiagnosisText", label: "Diagnóstico médico de referencia", value: medicalReferenceDiagnosisText, set: setMedical },
    { key: "kinesiologicImpressionText", label: "Impresión / diagnóstico kinésico", value: kinesiologicImpressionText, set: setKinesiologic },
    { key: "initialFunctionalStatus", label: "Estado funcional inicial", value: initialFunctionalStatus, set: setInitial },
    { key: "therapeuticGoals", label: "Objetivos terapéuticos", value: therapeuticGoals, set: setGoals },
    { key: "frameworkPlan", label: "Plan terapéutico general", value: frameworkPlan, set: setPlan },
  ] as const;

  return <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto clínico del tratamiento</h2><p className="mt-2 text-xs text-slate-600">Lectura primero + edición puntual por campo. El registro por visita sigue en Gestión clínica.</p>
    {message ? <p className={`mt-3 text-sm ${message.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p> : null}
    <div className="mt-3 space-y-3">
      {fields.map((field) => {
        const isEditing = activeField === field.key;
        const hasValue = field.value.trim().length > 0;
        return (
          <section key={field.key} className="rounded border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-800">{field.label}</p>
            {!isEditing ? (
              <>
                <p className="mt-1 text-sm text-slate-700">{hasValue ? field.value : "No registrado"}</p>
                <button type="button" className="mt-2 text-xs font-medium text-sky-700 underline-offset-2 hover:underline" onClick={() => setActiveField(field.key)}>{hasValue ? `Editar ${field.label.toLowerCase()}` : `Agregar ${field.label.toLowerCase()}`}</button>
              </>
            ) : (
              <form className="mt-2 space-y-2" onSubmit={handleSubmit}>
                <textarea className="w-full rounded border p-2 text-sm" rows={4} value={field.value} onChange={(e) => field.set(e.target.value)} />
                <div className="flex gap-2">
                  <button className="rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white" disabled={isPending} type="submit">{isPending ? "Guardando..." : "Guardar"}</button>
                  <button type="button" className="rounded border border-slate-300 px-3 py-1.5 text-xs" onClick={() => setActiveField(null)}>Cancelar</button>
                </div>
              </form>
            )}
          </section>
        );
      })}
    </div>
  </section>;
}
