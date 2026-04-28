"use client";

import { FormEvent, useState, useTransition } from "react";

import type { ServiceRequestRequesterType } from "@/domain/service-request/service-request.types";
import { formatLocalDateInputValue } from "@/lib/date-input";

import {
  createPatientServiceRequestAction,
  type CreatePatientServiceRequestActionResult,
} from "@/app/admin/patients/[id]/administrative/actions";

interface ServiceRequestCreateFormProps {
  patientId: string;
  onCancel: () => void;
  onSubmitted: (result: CreatePatientServiceRequestActionResult) => void;
}

const REQUESTER_TYPE_OPTIONS: Array<{ value: ServiceRequestRequesterType; label: string }> = [
  { value: "patient", label: "Paciente" },
  { value: "family", label: "Familiar" },
  { value: "caregiver", label: "Cuidador/a" },
  { value: "physician", label: "Profesional de salud" },
  { value: "other", label: "Otro" },
];

export function ServiceRequestCreateForm({
  patientId,
  onCancel,
  onSubmitted,
}: ServiceRequestCreateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [requestedAt, setRequestedAt] = useState(() => formatLocalDateInputValue(new Date()));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createPatientServiceRequestAction(patientId, formData);
      onSubmitted(result);
    });
  }

  return (
    <form className="mt-3 space-y-3 rounded-md border border-slate-300 bg-white p-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-800" htmlFor="requestedAt">
            Fecha de solicitud *
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            id="requestedAt"
            name="requestedAt"
            onChange={(event) => setRequestedAt(event.target.value)}
            required
            type="date"
            value={requestedAt}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800" htmlFor="requesterType">
            Tipo de solicitante
          </label>
          <select
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            defaultValue=""
            id="requesterType"
            name="requesterType"
          >
            <option value="">No informado</option>
            {REQUESTER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800" htmlFor="reasonText">
          Motivo de consulta *
        </label>
        <textarea
          className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
          id="reasonText"
          name="reasonText"
          required
          rows={3}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-800" htmlFor="reportedDiagnosisText">
            Diagnóstico informado
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            id="reportedDiagnosisText"
            name="reportedDiagnosisText"
            type="text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800" htmlFor="requesterDisplay">
            Quién solicita
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            id="requesterDisplay"
            name="requesterDisplay"
            type="text"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-800" htmlFor="requesterContact">
            Contacto del solicitante
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            id="requesterContact"
            name="requesterContact"
            type="text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800" htmlFor="notes">
            Notas internas
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            id="notes"
            name="notes"
            type="text"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500">El estado inicial se registra automáticamente como En evaluación.</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Registrar solicitud"}
        </button>
        <button
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          disabled={isPending}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
