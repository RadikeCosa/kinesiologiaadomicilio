import type { Encounter } from "@/domain/encounter/encounter.types";

interface EncountersListProps {
  encounters: Encounter[];
}

function formatOccurrenceDate(value: string): string {
  if (!value.trim()) {
    return "Sin fecha";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function EncountersList({ encounters }: EncountersListProps) {
  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Visitas registradas</h2>

      {encounters.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">
          No hay visitas registradas para este paciente.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {encounters.map((encounter) => (
            <li key={encounter.id} className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-800">
              <p className="font-medium">{formatOccurrenceDate(encounter.occurrenceDate)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-600">Estado: {encounter.status}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
