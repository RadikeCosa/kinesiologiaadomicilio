"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createEncounterAction } from "@/app/admin/patients/[id]/encounters/actions/create-encounter.action";

interface EncounterCreateFormProps {
  patientId: string;
  activeEpisodeId: string | null;
}

function getNowDateTimeLocal(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 16);
}

function normalizeOccurrenceDateInput(value: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return trimmedValue;
  }

  return parsedDate.toISOString();
}

export function EncounterCreateForm({ patientId, activeEpisodeId }: EncounterCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const canCreateEncounter = Boolean(activeEpisodeId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeEpisodeId) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const input = {
      patientId,
      episodeOfCareId: activeEpisodeId,
      occurrenceDate: normalizeOccurrenceDateInput(String(formData.get("occurrenceDate") ?? "")),
    };

    startTransition(async () => {
      const result = await createEncounterAction(input);

      setMessage(result.message ?? (result.ok ? "Visita registrada correctamente." : "No se pudo registrar."));

      if (result.ok) {
        router.refresh();
      }
    });
  }

  if (!canCreateEncounter) {
    return (
      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-lg font-medium text-amber-900">Registrar visita realizada</h2>
        <p className="mt-2 text-sm text-amber-900">
          No se puede registrar una visita porque el paciente no tiene tratamiento activo.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Registrar visita realizada</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <input name="episodeOfCareId" type="hidden" value={activeEpisodeId ?? ""} />

        <div>
          <label className="block text-sm font-medium" htmlFor="occurrenceDate">
            Fecha y hora de la visita *
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            defaultValue={getNowDateTimeLocal()}
            id="occurrenceDate"
            name="occurrenceDate"
            required
            type="datetime-local"
          />
        </div>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Registrar visita"}
        </button>
      </form>
    </section>
  );
}
