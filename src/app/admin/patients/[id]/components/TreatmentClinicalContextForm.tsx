"use client";

import { FormEvent, useState, useTransition } from "react";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { upsertEpisodeClinicalContextAction } from "@/app/admin/patients/[id]/actions/upsert-episode-clinical-context.action";
import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

export function TreatmentClinicalContextForm({ patientId, episodeOfCareId, initialData }: { patientId: string; episodeOfCareId: string; initialData: EpisodeClinicalContextReadModel | null }) {
  const [isPending, startTransition] = useTransition();
  const { message, setMessage } = useFormFeedback();
  const [medicalReferenceDiagnosisText, setMedical] = useState(initialData?.medicalReferenceDiagnosisText ?? "");
  const [kinesiologicImpressionText, setKinesiologic] = useState(initialData?.kinesiologicImpressionText ?? "");
  const [initialFunctionalStatus, setInitial] = useState(initialData?.initialFunctionalStatus ?? "");
  const [therapeuticGoals, setGoals] = useState(initialData?.therapeuticGoals ?? "");
  const [frameworkPlan, setPlan] = useState(initialData?.frameworkPlan ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await upsertEpisodeClinicalContextAction({
        patientId,
        episodeOfCareId,
        medicalReferenceDiagnosisText,
        kinesiologicImpressionText,
        initialFunctionalStatus,
        therapeuticGoals,
        frameworkPlan,
      });
      setMessage({ text: result.message ?? (result.ok ? "Guardado." : "Error al guardar."), tone: result.ok ? "success" : "error" });
    });
  }

  return <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto clínico del tratamiento</h2><p className="mt-2 text-xs text-slate-600">Información longitudinal del ciclo. No reemplaza el registro de cada visita.</p>
    <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
      {message ? <p className={`text-sm ${message.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p> : null}
      <textarea className="w-full rounded border p-2 text-sm" placeholder="Diagnóstico médico de referencia" rows={3} value={medicalReferenceDiagnosisText} onChange={(e) => setMedical(e.target.value)} />
      <textarea className="w-full rounded border p-2 text-sm" placeholder="Impresión kinésica" rows={3} value={kinesiologicImpressionText} onChange={(e) => setKinesiologic(e.target.value)} />
      <textarea className="w-full rounded border p-2 text-sm" placeholder="Situación inicial funcional" rows={3} value={initialFunctionalStatus} onChange={(e) => setInitial(e.target.value)} />
      <textarea className="w-full rounded border p-2 text-sm" placeholder="Objetivos terapéuticos" rows={3} value={therapeuticGoals} onChange={(e) => setGoals(e.target.value)} />
      <textarea className="w-full rounded border p-2 text-sm" placeholder="Plan marco del tratamiento" rows={3} value={frameworkPlan} onChange={(e) => setPlan(e.target.value)} />
      <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white" disabled={isPending} type="submit">{isPending ? "Guardando..." : "Guardar contexto"}</button>
    </form></section>;
}
