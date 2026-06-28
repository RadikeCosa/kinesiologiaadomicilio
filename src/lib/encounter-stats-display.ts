import type { EncounterStats } from "@/domain/encounter/encounter-stats";

export function formatEncounterMinutesAsDuration(value: number | null): string {
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

export function formatEncounterAverageVisitFrequency(stats: Pick<EncounterStats, "averageDaysBetweenEpisodeVisits">): string {
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
