"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { finishEpisodeOfCareAction } from "@/app/admin/patients/[id]/actions/finish-episode-of-care.action";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { formatLocalDateInputValue } from "@/lib/date-input";
import { EPISODE_OF_CARE_CLOSURE_REASON_LABELS, EPISODE_OF_CARE_CLOSURE_REASONS, type EpisodeOfCareClosureReason } from "@/domain/episode-of-care/episode-of-care.types";

interface FinishEpisodeOfCareFormProps {
  patient: PatientDetailReadModel;
}

export function FinishEpisodeOfCareForm({ patient }: FinishEpisodeOfCareFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { message, setMessage } = useFormFeedback();
  const [endDate, setEndDate] = useState(formatLocalDateInputValue());
  const [closureReason, setClosureReason] = useState<EpisodeOfCareClosureReason | "">("");
  const [closureDetail, setClosureDetail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const confirmed = window.confirm("¿Confirmás finalizar el tratamiento activo de este paciente?");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await finishEpisodeOfCareAction({
        patientId: patient.id,
        endDate,
        closureReason,
        closureDetail,
      });

      setMessage({
        text: result.ok
          ? result.message ?? "Tratamiento finalizado correctamente."
          : result.message ?? "No se pudo finalizar el tratamiento.",
        tone: result.ok ? "success" : "error",
      });

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
        Esta acción cierra formalmente el tratamiento activo del paciente.
      </p>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        {message ? (
          <p
            className={`mb-3 text-sm ${
              message.tone === "success" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <label className="block text-sm font-medium text-amber-900" htmlFor="endDate">
          Fecha de finalización
        </label>
        <input className="w-full rounded border border-amber-300 bg-white p-2 text-sm" id="endDate" name="endDate" onChange={(e) => setEndDate(e.target.value)} required type="date" value={endDate} />

        <label className="block text-sm font-medium text-amber-900" htmlFor="closureReason">
          Motivo de finalización
        </label>
        <select className="w-full rounded border border-amber-300 bg-white p-2 text-sm" id="closureReason" name="closureReason" onChange={(e) => setClosureReason(e.target.value as EpisodeOfCareClosureReason)} required value={closureReason}>
          <option value="">Seleccioná un motivo</option>
          {EPISODE_OF_CARE_CLOSURE_REASONS.map((reason) => (
            <option key={reason} value={reason}>{EPISODE_OF_CARE_CLOSURE_REASON_LABELS[reason]}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-amber-900" htmlFor="closureDetail">
          Detalle del cierre {closureReason === "other" ? "*" : "(opcional)"}
        </label>
        <textarea className="w-full rounded border border-amber-300 bg-white p-2 text-sm" id="closureDetail" name="closureDetail" onChange={(e) => setClosureDetail(e.target.value)} required={closureReason === "other"} rows={3} value={closureDetail} />

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
