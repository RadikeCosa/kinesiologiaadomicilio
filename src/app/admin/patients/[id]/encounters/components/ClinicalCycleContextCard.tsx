import Link from "next/link";

import type { EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";
import { formatDateDisplay } from "@/lib/patient-admin-display";
import { EPISODE_OF_CARE_CLOSURE_REASON_LABELS } from "@/domain/episode-of-care/episode-of-care.types";

interface Props {
  patientId: string;
  activeEpisode: { id: string; startDate: string } | null;
  mostRecentEpisode: { id: string; status: "active" | "finished"; startDate: string; endDate?: string; closureReason?: string; closureDetail?: string } | null;
  clinicalContext: EpisodeClinicalContextReadModel | null;
}

const truncate = (value?: string, max = 120) => (value && value.length > max ? `${value.slice(0, max).trim()}…` : value);

export function ClinicalCycleContextCard({ patientId, activeEpisode, mostRecentEpisode, clinicalContext }: Props) {
  const effectiveEpisode = activeEpisode ?? mostRecentEpisode;
  const isFinished = !activeEpisode && mostRecentEpisode?.status === "finished";
  const trunkFields = [clinicalContext?.medicalReferenceDiagnosisText, clinicalContext?.initialFunctionalStatus, clinicalContext?.therapeuticGoals];
  const completedCount = trunkFields.filter((item) => Boolean(item?.trim())).length;
  const hasAnyContent = Boolean(clinicalContext?.hasAnyContent);
  const completion = !activeEpisode ? "Sin tratamiento activo" : completedCount >= 3 ? "Completo" : completedCount > 0 ? "Parcial" : "Sin contexto";
  const ctaLabel = activeEpisode ? (completedCount >= 3 ? "Editar en Tratamiento" : "Completar contexto en Tratamiento") : "Ver ciclo en Tratamiento";

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto clínico del ciclo</h2>
        <Link className="text-xs font-medium text-slate-700 underline-offset-2 hover:underline" href={`/admin/patients/${patientId}/treatment`}>{ctaLabel}</Link>
      </div>
      <p className="mt-1 text-xs text-slate-600">Resumen longitudinal para interpretar visitas y tendencia. Edición en Tratamiento.</p>

      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p><span className="font-medium">Estado del ciclo:</span> {activeEpisode ? "Activo" : isFinished ? "Finalizado" : "Sin tratamiento activo"}</p>
        <p><span className="font-medium">Completitud:</span> {completion}</p>
        {effectiveEpisode?.startDate ? <p><span className="font-medium">Inicio:</span> {formatDateDisplay(effectiveEpisode.startDate)}</p> : null}
        {isFinished ? <p><span className="font-medium">Cierre:</span> {mostRecentEpisode?.endDate ? formatDateDisplay(mostRecentEpisode.endDate) : "Sin fecha registrada"}</p> : null}
      </div>

      {clinicalContext?.therapeuticGoals ? <p className="mt-2 text-sm text-slate-700"><span className="font-medium">Objetivo principal:</span> {truncate(clinicalContext.therapeuticGoals, 140)}</p> : null}
      {clinicalContext?.medicalReferenceDiagnosisText ? <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Diagnóstico de referencia:</span> {truncate(clinicalContext.medicalReferenceDiagnosisText, 120)}</p> : null}
      {clinicalContext?.initialFunctionalStatus ? <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Estado funcional inicial:</span> {truncate(clinicalContext.initialFunctionalStatus, 120)}</p> : null}

      {activeEpisode && completedCount < 3 && hasAnyContent ? <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Falta completar parte del contexto clínico del ciclo.</p> : null}

      {isFinished ? <p className="mt-2 text-xs font-medium text-slate-700">Visitas en modo historial.</p> : null}

      {hasAnyContent || isFinished ? (
        <details className="mt-3 rounded border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-xs font-medium text-slate-700">Ver detalle longitudinal</summary>
          <div className="mt-2 space-y-1 text-sm text-slate-700">
            {clinicalContext?.kinesiologicImpressionText ? <p><span className="font-medium">Impresión kinésica:</span> {clinicalContext.kinesiologicImpressionText}</p> : null}
            {clinicalContext?.frameworkPlan ? <p><span className="font-medium">Plan terapéutico general:</span> {clinicalContext.frameworkPlan}</p> : null}
            {clinicalContext?.therapeuticGoals ? <p><span className="font-medium">Objetivos completos:</span> {clinicalContext.therapeuticGoals}</p> : null}
            {clinicalContext?.initialFunctionalStatus ? <p><span className="font-medium">Estado funcional completo:</span> {clinicalContext.initialFunctionalStatus}</p> : null}
            {isFinished && mostRecentEpisode?.closureReason ? <p><span className="font-medium">Motivo de cierre:</span> {EPISODE_OF_CARE_CLOSURE_REASON_LABELS[mostRecentEpisode.closureReason as keyof typeof EPISODE_OF_CARE_CLOSURE_REASON_LABELS] ?? mostRecentEpisode.closureReason}</p> : null}
            {isFinished && mostRecentEpisode?.closureDetail ? <p><span className="font-medium">Detalle de cierre:</span> {mostRecentEpisode.closureDetail}</p> : null}
          </div>
        </details>
      ) : null}
    </section>
  );
}
