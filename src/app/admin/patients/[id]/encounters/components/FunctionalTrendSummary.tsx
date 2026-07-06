import { formatDateDisplay } from "@/lib/patient-admin-display";
import type { FunctionalObservationTrendSummary } from "@/app/admin/patients/[id]/encounters/functional-trend";
import { formatFunctionalDelta, formatFunctionalValue } from "@/app/admin/patients/[id]/encounters/functional-trend";

interface Props { trend: FunctionalObservationTrendSummary[] }

export function FunctionalTrendSummary({ trend }: Props) {
  if (trend.length === 0) return null;

  return (
    <section className="h-full rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Tendencia funcional del ciclo</h2>
      <p className="mt-1 text-xs text-slate-600">Señales calculadas sobre las mediciones del tratamiento actual completo, no solo sobre la actividad reciente.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {trend.map((item) => (
          <div key={item.code} className="rounded-md bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <div className="mt-2 px-0 py-0">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Último</p>
              <p className="text-sm font-semibold text-slate-900">{formatFunctionalValue(item.code, item.latestValue)}</p>
              <p className="text-[11px] text-slate-500">{formatDateDisplay(item.latestDate)}</p>
            </div>
            {item.previousValue !== undefined ? (
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <p>
                  <span className="font-medium text-slate-800">Previo:</span>{" "}
                  {formatFunctionalValue(item.code, item.previousValue)}
                  <span className="text-slate-500"> ({formatDateDisplay(item.previousDate)})</span>
                </p>
                <p>
                  <span className="font-medium text-slate-800">Cambio:</span>{" "}
                  <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-slate-800">
                    {formatFunctionalDelta(item.code, item.delta ?? 0)}
                  </span>
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-600">Sin comparación previa</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
