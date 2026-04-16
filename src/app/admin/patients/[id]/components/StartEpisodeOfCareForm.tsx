"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { startEpisodeOfCareAction } from "@/app/admin/patients/[id]/actions/start-episode-of-care.action";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface StartEpisodeOfCareFormProps {
  patient: PatientDetailReadModel;
}

export function StartEpisodeOfCareForm({ patient }: StartEpisodeOfCareFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const availability = useMemo(() => {
    if (!patient.dni) {
      return { enabled: false, reason: "Identidad incompleta: cargá DNI para iniciar tratamiento." };
    }

    if (patient.activeEpisode) {
      return { enabled: false, reason: "Este paciente ya tiene un tratamiento activo." };
    }

    return { enabled: true, reason: null as string | null };
  }, [patient.activeEpisode, patient.dni]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!availability.enabled) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const input = {
      patientId: patient.id,
      startDate: String(formData.get("startDate") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
    };

    startTransition(async () => {
      const result = await startEpisodeOfCareAction(input);
      setMessage(
        result.message ?? (result.ok ? "Tratamiento iniciado correctamente." : "No se pudo iniciar."),
      );
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <section className="mt-6 rounded border border-gray-200 p-4">
      <h2 className="text-lg font-medium">Iniciar tratamiento activo</h2>

      {availability.reason ? <p className="mt-2 text-sm text-gray-700">{availability.reason}</p> : null}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium" htmlFor="startDate">
            Fecha de inicio *
          </label>
          <input
            className="mt-1 w-full rounded border p-2"
            defaultValue={new Date().toISOString().slice(0, 10)}
            id="startDate"
            name="startDate"
            required
            type="date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="description">
            Descripción
          </label>
          <textarea className="mt-1 w-full rounded border p-2" id="description" name="description" rows={2} />
        </div>

        {message ? <p className="text-sm text-gray-700">{message}</p> : null}

        <button
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={!availability.enabled || isPending}
          type="submit"
        >
          {isPending ? "Iniciando..." : "Iniciar tratamiento"}
        </button>
      </form>
    </section>
  );
}
