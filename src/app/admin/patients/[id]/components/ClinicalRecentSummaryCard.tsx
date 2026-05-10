import Link from "next/link";

import { formatDateDisplay } from "@/lib/patient-admin-display";
import type { PatientClinicalRecentSummary } from "@/app/admin/patients/[id]/data";

export function ClinicalRecentSummaryCard({
  patientId,
  summary,
  showCta = true,
}: {
  patientId: string;
  summary: PatientClinicalRecentSummary;
  showCta?: boolean;
}) {
  const latestVisitLabel = summary.latestEncounterLabel === "Aún no registrada" || summary.latestEncounterLabel === "No disponible"
    ? summary.latestEncounterLabel
    : formatDateDisplay(summary.latestEncounterLabel);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-900">Resumen clínico reciente</h2>
      <p className="mt-0.5 text-xs text-slate-500">Síntesis rápida. El detalle está en Gestión clínica.</p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        <p><span className="font-medium">Estado del tratamiento:</span> {summary.treatmentStatusLabel}</p>
        <p><span className="font-medium">Última visita:</span> {latestVisitLabel}</p>
        <p><span className="font-medium">Visitas del episodio:</span> {summary.encountersCount}</p>
        {summary.medicalReferenceDiagnosisText ? (
          <p><span className="font-medium">Diagnóstico médico:</span> {summary.medicalReferenceDiagnosisText}</p>
        ) : null}
        {summary.kinesiologicDiagnosisText ? (
          <p><span className="font-medium">Impresión kinésica:</span> {summary.kinesiologicDiagnosisText}</p>
        ) : null}
        {!summary.medicalReferenceDiagnosisText && !summary.kinesiologicDiagnosisText ? (
          <p><span className="font-medium">Marco clínico:</span> incompleto</p>
        ) : null}
        {summary.metrics.length > 0 ? (
          <p>
            <span className="font-medium">Métricas recientes:</span>{" "}
            {summary.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(" · ")}
          </p>
        ) : (
          <p><span className="font-medium">Métricas recientes:</span> {summary.metricsEmptyLabel}</p>
        )}
      </div>
      {showCta ? (
        <Link
          className="mt-2 inline-flex items-center text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${patientId}/encounters`}
        >
          {summary.ctaLabel}
        </Link>
      ) : null}
    </section>
  );
}
