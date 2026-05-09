import { formatDateDisplay } from "@/lib/patient-admin-display";
import type { FunctionalObservationTrendSummary } from "@/app/admin/patients/[id]/encounters/functional-trend";
import { formatFunctionalDelta, formatFunctionalValue } from "@/app/admin/patients/[id]/encounters/functional-trend";

interface Props { trend: FunctionalObservationTrendSummary[] }

export function FunctionalTrendSummary({ trend }: Props) {
  if (trend.length === 0) return null;

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Tendencia funcional</h2>
      <p className="mt-1 text-xs text-slate-600">Comparación simple entre mediciones registradas en visitas del tratamiento actual. No implica interpretación clínica automática.</p>
      <div className="mt-3 space-y-3">
        {trend.map((item) => (
          <div key={item.code} className="rounded border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="text-xs text-slate-700">Último: {formatFunctionalValue(item.latestValue, item.unit)} ({formatDateDisplay(item.latestDate)})</p>
            {item.previousValue !== undefined ? (
              <>
                <p className="text-xs text-slate-700">Previo: {formatFunctionalValue(item.previousValue, item.unit)} ({formatDateDisplay(item.previousDate)})</p>
                <p className="text-xs text-slate-700">Cambio: {formatFunctionalDelta(item.delta ?? 0, item.unit)}</p>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
