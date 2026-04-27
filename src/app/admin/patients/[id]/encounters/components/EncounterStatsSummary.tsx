import type { EncounterStats } from "@/domain/encounter/encounter-stats";
import { formatDateTimeDisplay } from "@/lib/patient-admin-display";

interface EncounterStatsSummaryProps {
  stats: EncounterStats;
}

function formatMinutesAsDuration(value: number | null): string {
  if (value === null) {
    return "—";
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

function formatLastVisit(value: string | null): string {
  if (!value) {
    return "—";
  }

  return formatDateTimeDisplay(value);
}

interface MetricCardProps {
  label: string;
  value: string | number;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="rounded border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </article>
  );
}

export function EncounterStatsSummary({ stats }: EncounterStatsSummaryProps) {
  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3" aria-label="Estadísticas de visitas">
      <h2 className="text-sm font-semibold text-slate-900">Estadísticas de visitas</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Visitas registradas" value={stats.totalCount} />
        <MetricCard label="En este tratamiento" value={stats.treatmentCount} />
        <MetricCard label="Última visita" value={formatLastVisit(stats.lastStartedAt)} />
        <MetricCard label="Duración promedio" value={formatMinutesAsDuration(stats.averageDurationMinutes)} />
        <MetricCard label="Tiempo total registrado" value={formatMinutesAsDuration(stats.totalDurationMinutes)} />
        <MetricCard label="Excluidas del cálculo de duración" value={stats.durationExcludedCount} />
      </div>

      {stats.durationExcludedCount > 0 ? (
        <p className="mt-3 text-xs text-slate-600">Incluye visitas sin cierre, legacy o con fechas no válidas.</p>
      ) : null}

      {stats.isDurationPartial ? (
        <p className="mt-3 text-xs text-slate-600">
          Calculado sobre {stats.durationEligibleCount} de {stats.totalCount} visitas.
        </p>
      ) : null}

      {stats.durationEligibleCount === 0 && stats.totalCount > 0 ? (
        <p className="mt-3 text-xs text-slate-600">
          No hay visitas con duración explícita válida para calcular duración promedio y tiempo total.
        </p>
      ) : null}
    </section>
  );
}
