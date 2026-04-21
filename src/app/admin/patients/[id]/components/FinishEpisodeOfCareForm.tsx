"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { finishEpisodeOfCareAction } from "@/app/admin/patients/[id]/actions/finish-episode-of-care.action";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface FinishEpisodeOfCareFormProps {
  patient: PatientDetailReadModel;
}

export function FinishEpisodeOfCareForm({ patient }: FinishEpisodeOfCareFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const confirmed = window.confirm("¿Confirmás finalizar el tratamiento activo de este paciente?");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await finishEpisodeOfCareAction({
        patientId: patient.id,
        endDate: new Date().toISOString().slice(0, 10),
      });

      setMessage(
        result.message ?? (result.ok ? "Tratamiento finalizado correctamente." : "No se pudo finalizar."),
      );

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-base font-semibold text-amber-900">
        Finalizar tratamiento activo
      </h3>
      <p className="mt-2 text-sm text-amber-900">
        Esta acción cierra formalmente el EpisodeOfCare activo del paciente.
      </p>

      <form className="mt-4" onSubmit={handleSubmit}>
        {message ? <p className="mb-3 text-sm text-amber-900">{message}</p> : null}

        <button
          className="rounded bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Finalizando..." : "Finalizar tratamiento"}
        </button>
      </form>
    </section>
  );
}
