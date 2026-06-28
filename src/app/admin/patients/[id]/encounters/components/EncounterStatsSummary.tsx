import type { EncounterStats } from "@/domain/encounter/encounter-stats";
import { formatDateTimeDisplay } from "@/lib/patient-admin-display";
import {
  formatEncounterAverageVisitFrequency,
  formatEncounterMinutesAsDuration,
} from "@/lib/encounter-stats-display";

interface EncounterStatsSummaryProps {
  stats: EncounterStats;
}

function formatLastVisit(value: string | null): string {
  if (!value) {
    return "—";
  }

  return formatDateTimeDisplay(value);
}

function formatFirstVisitFromTreatmentStart(stats: EncounterStats): string {
  if (stats.daysToFirstVisitFromEpisodeStart === null) {
    return "Sin datos suficientes";
  }

  if (stats.isFirstVisitBeforeEpisodeStart) {
    return "Antes del inicio registrado";
  }

  if (stats.daysToFirstVisitFromEpisodeStart < 1) {
    return "El mismo día del inicio";
  }

  const roundedDays = Math.ceil(stats.daysToFirstVisitFromEpisodeStart);

  if (roundedDays <= 1) {
    return "Al día siguiente del inicio";
  }

  return `A los ${roundedDays} días del inicio`;
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
  const hasPunctualityKpi = stats.punctualityWithDataCount > 0;

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3" aria-label="Estadísticas de visitas">
      <h2 className="text-sm font-semibold text-slate-900">Estadísticas de visitas</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded border border-slate-200 bg-white px-3 py-2">
          <p className="text-xs text-slate-600">Visitas del tratamiento</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{stats.treatmentCount}</p>
          {hasPunctualityKpi ? (
            <div className="mt-1 space-y-0.5">
              <p className="text-xs text-slate-600">
                Puntualidad: {stats.punctualityOnTimeOrMinorDelayCount}/{stats.punctualityWithDataCount} en horario o demora leve
              </p>
              {stats.punctualityMissingCount > 0 ? (
                <p className="text-xs text-slate-500">{stats.punctualityMissingCount} sin dato</p>
              ) : null}
            </div>
          ) : null}
        </article>
        <MetricCard label="Última visita" value={formatLastVisit(stats.lastStartedAt)} />
        <MetricCard label="Primera visita" value={formatFirstVisitFromTreatmentStart(stats)} />
        <MetricCard label="Frecuencia promedio" value={formatEncounterAverageVisitFrequency(stats)} />
        <MetricCard label="Duración promedio" value={formatEncounterMinutesAsDuration(stats.averageDurationMinutes)} />
        <MetricCard label="Tiempo total registrado" value={formatEncounterMinutesAsDuration(stats.totalDurationMinutes)} />
      </div>

      {stats.durationExcludedCount > 0 ? (
        <p className="mt-3 text-xs text-slate-600">
          * Duración calculada sobre {stats.durationEligibleCount} de {stats.treatmentCount} visitas del tratamiento. Se
          excluyen visitas sin cierre, legacy o con fechas no válidas.
        </p>
      ) : null}
    </section>
  );
}
