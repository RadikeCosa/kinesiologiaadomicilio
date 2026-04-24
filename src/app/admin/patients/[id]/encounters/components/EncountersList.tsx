import React from "react";
import type { Encounter } from "@/domain/encounter/encounter.types";
import { formatDateTimeDisplay, formatEncounterStatusLabel } from "@/lib/patient-admin-display";

interface EncountersListProps {
  encounters: Encounter[];
  hasActiveTreatment: boolean;
}

function formatOccurrenceDate(value: string): string {
  return formatDateTimeDisplay(value);
}

export function EncountersList({ encounters, hasActiveTreatment }: EncountersListProps) {
  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Visitas registradas</h2>

      {encounters.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">
          {hasActiveTreatment
            ? "Todavía no hay visitas. Registrá la primera."
            : "Iniciá un tratamiento para poder registrar visitas."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {encounters.map((encounter) => (
            <li key={encounter.id} className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-800">
              <p className="font-medium">{formatOccurrenceDate(encounter.occurrenceDate)}</p>
              <p className="mt-1 text-xs text-slate-600">Estado: {formatEncounterStatusLabel(encounter.status)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
