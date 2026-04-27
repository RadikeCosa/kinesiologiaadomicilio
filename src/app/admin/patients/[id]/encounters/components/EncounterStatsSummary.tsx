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

function formatAverageVisitFrequency(stats: EncounterStats): string {
  if (stats.averageDaysBetweenEpisodeVisits === null) {
    return "Aún no calculable";
  }

  if (stats.averageDaysBetweenEpisodeVisits < 1) {
    return "Menos de 1 día";
  }

  if (stats.averageDaysBetweenEpisodeVisits < 1.5) {
    return "Una visita cada 1 día";
  }

  const roundedDays = Math.round(stats.averageDaysBetweenEpisodeVisits);
  return `Una visita cada ${roundedDays} días`;
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
        <MetricCard label="Visitas del tratamiento" value={stats.treatmentCount} />
        <MetricCard label="Última visita" value={formatLastVisit(stats.lastStartedAt)} />
        <MetricCard label="Primera visita" value={formatFirstVisitFromTreatmentStart(stats)} />
        <MetricCard label="Frecuencia promedio" value={formatAverageVisitFrequency(stats)} />
        <MetricCard label="Duración promedio" value={formatMinutesAsDuration(stats.averageDurationMinutes)} />
        <MetricCard label="Tiempo total registrado" value={formatMinutesAsDuration(stats.totalDurationMinutes)} />
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
