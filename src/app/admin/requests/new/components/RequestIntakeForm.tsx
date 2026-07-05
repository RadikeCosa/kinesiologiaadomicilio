"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ServiceRequestRequesterType } from "@/domain/service-request/service-request.types";
import { formatLocalDateInputValue } from "@/lib/date-input";

import { createRequestIntakeAction } from "@/app/admin/requests/new/actions/create-request-intake.action";

const REQUESTER_TYPE_OPTIONS: Array<{ value: ServiceRequestRequesterType; label: string }> = [
  { value: "patient", label: "Paciente" },
  { value: "family", label: "Familiar" },
  { value: "caregiver", label: "Cuidador/a" },
  { value: "physician", label: "Profesional de salud" },
  { value: "other", label: "Otro" },
];

export function RequestIntakeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [requestedAt, setRequestedAt] = useState(() => formatLocalDateInputValue(new Date()));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const input = {
      requestedAt,
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      contactPhone: String(formData.get("contactPhone") ?? ""),
      reasonText: String(formData.get("reasonText") ?? ""),
      dni: String(formData.get("dni") ?? "") || undefined,
      address: String(formData.get("address") ?? "") || undefined,
      requesterDisplay: String(formData.get("requesterDisplay") ?? "") || undefined,
      requesterType: String(formData.get("requesterType") ?? "") || undefined,
    };

    startTransition(async () => {
      const result = await createRequestIntakeAction(input);

      if (result.redirectTo) {
        setMessage(null);
        router.push(result.redirectTo);
        router.refresh();
        return;
      }

      setMessage(result.message);
    });
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium text-slate-900">Consulta inicial</h2>
      <p className="mt-2 text-sm text-slate-600">
        Registrá la consulta inicial y definí luego si avanza a tratamiento.
      </p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium" htmlFor="requestedAt">
            Fecha de solicitud *
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            id="requestedAt"
            name="requestedAt"
            onChange={(event) => setRequestedAt(event.target.value)}
            required
            type="date"
            value={requestedAt}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="firstName">
              Nombre del paciente *
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              id="firstName"
              name="firstName"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="lastName">
              Apellido del paciente *
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              id="lastName"
              name="lastName"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="contactPhone">
              Teléfono de contacto *
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              id="contactPhone"
              inputMode="tel"
              name="contactPhone"
              placeholder="Ej: 299 15 521-7189"
              required
              type="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="dni">
              DNI
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              id="dni"
              name="dni"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="address">
            Domicilio o zona de atención
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            id="address"
            name="address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="reasonText">
            Motivo de consulta *
          </label>
          <textarea
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            id="reasonText"
            name="reasonText"
            required
            rows={4}
          />
        </div>

        <section className="rounded border border-slate-200 bg-white p-3" aria-labelledby="quien-consulta-title">
          <h3 className="text-sm font-semibold text-slate-900" id="quien-consulta-title">
            Quién consulta
          </h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium" htmlFor="requesterDisplay">
                Nombre de quien consulta
              </label>
              <input
                className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
                id="requesterDisplay"
                name="requesterDisplay"
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="requesterType">
                Relación con el paciente
              </label>
              <select
                className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
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
        </section>

        <p className="text-xs text-slate-500">
          La solicitud se registra automáticamente como En evaluación. No crea tratamiento ni habilita visitas.
        </p>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Registrar solicitud"}
        </button>
      </form>
    </section>
  );
}
