import Link from "next/link";

import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";
import { formatDateDisplay } from "@/lib/patient-admin-display";

interface Props {
  patientId: string;
  activeEpisode: { id: string; startDate: string } | null;
  mostRecentEpisode: { id: string; status: "active" | "finished"; startDate: string; endDate?: string; closureReason?: string; closureDetail?: string } | null;
  clinicalContext: EpisodeClinicalContextReadModel | null;
}

const truncate = (value?: string, max = 120) => (value && value.length > max ? `${value.slice(0, max).trim()}…` : value);
const getDisplayValue = (value?: string) => (value?.trim() ? truncate(value) : "No registrado");

export function ClinicalCycleContextCard({ patientId, activeEpisode, mostRecentEpisode, clinicalContext }: Props) {
  const effectiveEpisode = activeEpisode ?? mostRecentEpisode;
  const isFinished = !activeEpisode && mostRecentEpisode?.status === "finished";
  const hasAnyContent = Boolean(clinicalContext?.hasAnyContent);
  const ctaLabel = "Ver/editar en Tratamiento";

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto clínico del ciclo</h2>
        <Link className="text-xs font-medium text-slate-700 underline-offset-2 hover:underline" href={`/admin/patients/${patientId}/treatment`}>{ctaLabel}</Link>
      </div>
      <p className="mt-1 text-xs text-slate-600">Resumen longitudinal para interpretar visitas y tendencia. Edición en Tratamiento.</p>

      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p><span className="font-medium">Estado del ciclo:</span> {activeEpisode ? "Activo" : isFinished ? "Finalizado" : "Sin tratamiento activo"}</p>
        {effectiveEpisode?.startDate ? <p><span className="font-medium">Inicio:</span> {formatDateDisplay(effectiveEpisode.startDate)}</p> : null}
        {isFinished ? <p><span className="font-medium">Cierre:</span> {mostRecentEpisode?.endDate ? formatDateDisplay(mostRecentEpisode.endDate) : "Sin fecha registrada"}</p> : null}
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p><span className="font-medium">Diagnóstico médico de referencia:</span> {getDisplayValue(clinicalContext?.medicalReferenceDiagnosisText)}</p>
        <p><span className="font-medium">Diagnóstico kinésico:</span> {getDisplayValue(clinicalContext?.kinesiologicDiagnosisText)}</p>
        <p><span className="font-medium">Situación funcional inicial:</span> {getDisplayValue(clinicalContext?.initialFunctionalStatus)}</p>
        <p><span className="font-medium">Objetivo de tratamiento:</span> {getDisplayValue(clinicalContext?.therapeuticGoals)}</p>
        <p><span className="font-medium">Plan marco del tratamiento:</span> {getDisplayValue(clinicalContext?.frameworkPlan)}</p>
      </div>

      {activeEpisode && !hasAnyContent ? <p className="mt-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">Este ciclo todavía no registra contexto clínico.</p> : null}

      {isFinished ? <p className="mt-2 text-xs font-medium text-slate-700">Visitas en modo historial.</p> : null}
    </section>
  );
}
