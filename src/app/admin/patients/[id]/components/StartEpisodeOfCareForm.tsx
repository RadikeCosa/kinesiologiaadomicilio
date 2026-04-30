"use client";

import { FormEvent, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { startEpisodeOfCareAction } from "@/app/admin/patients/[id]/actions/start-episode-of-care.action";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { formatLocalDateInputValue } from "@/lib/date-input";

interface StartEpisodeOfCareFormProps {
  patient: PatientDetailReadModel;
  serviceRequestId?: string;
}

export function StartEpisodeOfCareForm({
  patient,
  serviceRequestId,
}: StartEpisodeOfCareFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { message, setMessage } = useFormFeedback();

  const availability = useMemo(() => {
    if (!patient.dni) {
      return {
        enabled: false,
        reason: "Identidad incompleta: cargá DNI para iniciar tratamiento.",
      };
    }

    if (!serviceRequestId) {
      return {
        enabled: false,
        reason: "Para iniciar un tratamiento, primero aceptá una solicitud de atención desde Administración.",
      };
    }

    if (patient.activeEpisode) {
      return {
        enabled: false,
        reason: "Este paciente ya tiene un tratamiento activo.",
      };
    }

    return { enabled: true, reason: null as string | null };
  }, [patient.activeEpisode, patient.dni, serviceRequestId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!availability.enabled) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const input = {
      patientId: patient.id,
      startDate: String(formData.get("startDate") ?? ""),
      serviceRequestId: serviceRequestId
        ? String(formData.get("serviceRequestId") ?? serviceRequestId)
        : undefined,
    };

    startTransition(async () => {
      const result = await startEpisodeOfCareAction(input);
      setMessage({
        text: result.ok
          ? result.message ?? "Tratamiento iniciado correctamente."
          : result.message ?? "No se pudo iniciar el tratamiento.",
        tone: result.ok ? "success" : "error",
      });
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <section>
      <h3 className="text-base font-semibold text-slate-900">
        Iniciar tratamiento
      </h3>

      {availability.reason ? (
        <p className="mt-2 text-sm text-slate-700">{availability.reason}</p>
      ) : null}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        {serviceRequestId ? (
          <input name="serviceRequestId" type="hidden" value={serviceRequestId} />
        ) : null}
        <div>
          <label className="block text-sm font-medium" htmlFor="startDate">
            Fecha de inicio *
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            defaultValue={formatLocalDateInputValue()}
            id="startDate"
            name="startDate"
            required
            type="date"
          />
        </div>

        {message ? (
          <p
            className={`text-sm ${
              message.tone === "success" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={!availability.enabled || isPending}
          type="submit"
        >
          {isPending ? "Iniciando..." : "Iniciar tratamiento"}
        </button>
      </form>
    </section>
  );
}
