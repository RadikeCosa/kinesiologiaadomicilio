import Link from "next/link";

import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

interface Props {
  patientId: string;
  activeEpisode: { id: string; startDate: string } | null;
  mostRecentEpisode: { id: string; status: "active" | "finished"; startDate: string; endDate?: string; closureReason?: string; closureDetail?: string } | null;
  clinicalContext: EpisodeClinicalContextReadModel | null;
}

const truncate = (value?: string, max = 120) => (value && value.length > max ? `${value.slice(0, max).trim()}…` : value);
const getSummaryValue = (value?: string) => (value?.trim() ? truncate(value) : "Sin dato");
const getDetailValue = (value?: string) => (value?.trim() ? value.trim() : "Sin dato");

export function ClinicalCycleContextCard({ patientId, activeEpisode, mostRecentEpisode, clinicalContext }: Props) {
  const isFinished = !activeEpisode && mostRecentEpisode?.status === "finished";
  const hasAnyContent = Boolean(clinicalContext?.hasAnyContent);
  const ctaLabel = "Ver/editar en Tratamiento";
  const summaryFields = [
    {
      label: "Situación funcional inicial",
      value: getSummaryValue(clinicalContext?.initialFunctionalStatus),
    },
    {
      label: "Objetivo de tratamiento",
      value: getSummaryValue(clinicalContext?.therapeuticGoals),
    },
    {
      label: "Plan marco del tratamiento",
      value: getSummaryValue(clinicalContext?.frameworkPlan),
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Contexto clínico del ciclo</h2>
          <p className="mt-1 text-xs text-slate-600">Referencia clínica breve para interpretar la actividad reciente del tratamiento.</p>
        </div>
        <Link className="text-xs font-medium text-slate-700 underline-offset-2 hover:underline" href={`/admin/patients/${patientId}/treatment`}>{ctaLabel}</Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-3">
        {summaryFields.map((field) => (
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700" key={field.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{field.label}</p>
            <p className="mt-1">{field.value}</p>
          </div>
        ))}
      </div>

      <details className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-800">Ver detalle longitudinal</summary>
        <div className="mt-3 space-y-1 text-sm text-slate-700">
          <p className="rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            Este contexto se consulta en modo lectura desde Gestión clínica y se edita en Tratamiento.
          </p>
          <p><span className="font-medium">Diagnóstico médico de referencia:</span> {getDetailValue(clinicalContext?.medicalReferenceDiagnosisText)}</p>
          <p><span className="font-medium">Diagnóstico kinésico:</span> {getDetailValue(clinicalContext?.kinesiologicDiagnosisText)}</p>
          <p><span className="font-medium">Situación funcional inicial:</span> {getDetailValue(clinicalContext?.initialFunctionalStatus)}</p>
          <p><span className="font-medium">Objetivo de tratamiento:</span> {getDetailValue(clinicalContext?.therapeuticGoals)}</p>
          <p><span className="font-medium">Plan marco del tratamiento:</span> {getDetailValue(clinicalContext?.frameworkPlan)}</p>
          {!hasAnyContent ? (
            <p className="mt-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              Este ciclo todavía no registra contexto clínico.
            </p>
          ) : null}
          {isFinished ? <p className="mt-2 text-xs font-medium text-slate-700">Visitas en modo historial.</p> : null}
        </div>
      </details>

      {!hasAnyContent && activeEpisode ? (
        <p className="mt-3 text-xs text-slate-600">Todavía no hay contexto longitudinal cargado para este ciclo.</p>
      ) : null}
    </section>
  );
}
