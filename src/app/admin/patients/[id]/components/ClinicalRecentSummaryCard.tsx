import Link from "next/link";

import { formatDateDisplay } from "@/lib/patient-admin-display";
import type { PatientClinicalRecentSummary } from "@/app/admin/patients/[id]/data";

export function ClinicalRecentSummaryCard({ patientId, summary }: { patientId: string; summary: PatientClinicalRecentSummary }) {
  const latestVisitLabel = summary.latestEncounterLabel === "Aún no registrada" || summary.latestEncounterLabel === "No disponible"
    ? summary.latestEncounterLabel
    : formatDateDisplay(summary.latestEncounterLabel);

  return (
    <section className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-900">Resumen clínico reciente</h2>
      <p className="mt-0.5 text-xs text-slate-500">Vista resumida. El detalle está en Gestión clínica.</p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        <p><span className="font-medium">Estado del tratamiento:</span> {summary.treatmentStatusLabel}</p>
        <p><span className="font-medium">Última visita:</span> {latestVisitLabel}</p>
        <p><span className="font-medium">Visitas del episodio:</span> {summary.encountersCount}</p>
        {summary.metrics.length > 0 ? (
          <p>
            <span className="font-medium">Métricas recientes:</span>{" "}
            {summary.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(" · ")}
          </p>
        ) : (
          <p><span className="font-medium">Métricas recientes:</span> {summary.metricsEmptyLabel}</p>
        )}
      </div>
      <Link
        className="mt-2 inline-flex items-center justify-center rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        href={`/admin/patients/${patientId}/encounters`}
      >
        {summary.ctaLabel}
      </Link>
    </section>
  );
}
