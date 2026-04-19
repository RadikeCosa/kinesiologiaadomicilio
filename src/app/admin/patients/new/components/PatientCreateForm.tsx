"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { createPatientAction } from "@/app/admin/patients/actions/create-patient.action";

export function PatientCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const input = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      dni: String(formData.get("dni") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      address: String(formData.get("address") ?? "") || undefined,
    };

    startTransition(async () => {
      const result = await createPatientAction(input);

      if (!result.ok) {
        setMessage(result.message ?? "No se pudo crear el paciente.");
        return;
      }

      setMessage(null);
      if (result.patientId) {
        router.push(`/admin/patients/${result.patientId}`);
        router.refresh();
      }
    });
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Alta mínima de paciente</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium" htmlFor="firstName">
            Nombre *
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
            Apellido *
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            id="lastName"
            name="lastName"
            required
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

        <div>
          <label className="block text-sm font-medium" htmlFor="phone">
            Teléfono
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            id="phone"
            name="phone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="address">
            Dirección
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            id="address"
            name="address"
          />
        </div>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creando..." : "Crear paciente"}
        </button>
      </form>
    </section>
  );
}
