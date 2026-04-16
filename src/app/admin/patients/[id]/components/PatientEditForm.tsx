"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updatePatientAction } from "@/app/admin/patients/[id]/actions/update-patient.action";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface PatientEditFormProps {
  patient: PatientDetailReadModel;
}

export function PatientEditForm({ patient }: PatientEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const input = {
      id: patient.id,
      dni: String(formData.get("dni") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
      mainContact: {
        name: String(formData.get("mainContactName") ?? "") || undefined,
        relationship: String(formData.get("mainContactRelationship") ?? "") || undefined,
        phone: String(formData.get("mainContactPhone") ?? "") || undefined,
      },
      initialContext: {
        reasonForConsultation: String(formData.get("initialReason") ?? "") || undefined,
      },
    };

    startTransition(async () => {
      const result = await updatePatientAction(input);
      setMessage(result.message ?? (result.ok ? "Paciente actualizado correctamente." : "Error."));
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <section className="mt-6 rounded border border-gray-200 p-4">
      <h2 className="text-lg font-medium">Editar datos del paciente</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium" htmlFor="dni">
            DNI
          </label>
          <input className="mt-1 w-full rounded border p-2" defaultValue={patient.dni ?? ""} id="dni" name="dni" />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="phone">
            Teléfono
          </label>
          <input
            className="mt-1 w-full rounded border p-2"
            defaultValue={patient.phone ?? ""}
            id="phone"
            name="phone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="notes">
            Notas
          </label>
          <textarea
            className="mt-1 w-full rounded border p-2"
            defaultValue={patient.patientNotes ?? ""}
            id="notes"
            name="notes"
            rows={3}
          />
        </div>

        <details>
          <summary className="cursor-pointer text-sm font-medium">Contacto principal y contexto inicial (básico)</summary>
          <div className="mt-3 space-y-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="mainContactName">
                Contacto principal - Nombre
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                defaultValue={patient.mainContact?.name ?? ""}
                id="mainContactName"
                name="mainContactName"
              />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="mainContactRelationship">
                Contacto principal - Vínculo
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                defaultValue={patient.mainContact?.relationship ?? ""}
                id="mainContactRelationship"
                name="mainContactRelationship"
              />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="mainContactPhone">
                Contacto principal - Teléfono
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                defaultValue={patient.mainContact?.phone ?? ""}
                id="mainContactPhone"
                name="mainContactPhone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="initialReason">
                Contexto inicial - Motivo
              </label>
              <textarea
                className="mt-1 w-full rounded border p-2"
                defaultValue={patient.initialContext?.reasonForConsultation ?? ""}
                id="initialReason"
                name="initialReason"
                rows={2}
              />
            </div>
          </div>
        </details>

        {message ? <p className="text-sm text-gray-700">{message}</p> : null}

        <button
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
