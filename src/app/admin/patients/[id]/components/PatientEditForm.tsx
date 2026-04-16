"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updatePatientAction } from "@/app/admin/patients/[id]/actions/update-patient.action";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface PatientEditFormProps {
  patient: PatientDetailReadModel;
}

function hasSomeValue(values: Array<string | undefined>): boolean {
  return values.some(Boolean);
}

export function PatientEditForm({ patient }: PatientEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const mainContactName = String(formData.get("mainContactName") ?? "") || undefined;
    const mainContactRelationship = String(formData.get("mainContactRelationship") ?? "") || undefined;
    const mainContactPhone = String(formData.get("mainContactPhone") ?? "") || undefined;
    const initialReason = String(formData.get("initialReason") ?? "") || undefined;

    const input = {
      id: patient.id,
      dni: String(formData.get("dni") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
      mainContact: hasSomeValue([mainContactName, mainContactRelationship, mainContactPhone])
        ? {
            name: mainContactName,
            relationship: mainContactRelationship,
            phone: mainContactPhone,
          }
        : undefined,
      initialContext: hasSomeValue([initialReason])
        ? {
            reasonForConsultation: initialReason,
          }
        : undefined,
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
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Editar datos del paciente</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium" htmlFor="dni">
            DNI
          </label>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white p-2" defaultValue={patient.dni ?? ""} id="dni" name="dni" />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="phone">
            Teléfono
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            defaultValue={patient.phone ?? ""}
            id="phone"
            name="phone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="notes">
            Notas generales del paciente
          </label>
          <textarea
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            defaultValue={patient.patientNotes ?? ""}
            id="notes"
            name="notes"
            rows={3}
          />
        </div>

        <fieldset className="space-y-4 rounded border border-slate-200 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Contacto principal (opcional)
          </legend>
          <div>
            <label className="block text-sm font-medium" htmlFor="mainContactName">
              Nombre
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={patient.mainContact?.name ?? ""}
              id="mainContactName"
              name="mainContactName"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="mainContactRelationship">
              Vínculo
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={patient.mainContact?.relationship ?? ""}
              id="mainContactRelationship"
              name="mainContactRelationship"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="mainContactPhone">
              Teléfono
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={patient.mainContact?.phone ?? ""}
              id="mainContactPhone"
              name="mainContactPhone"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded border border-slate-200 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Contexto inicial del caso
          </legend>
          <div>
            <label className="block text-sm font-medium" htmlFor="initialReason">
              Motivo o contexto inicial
            </label>
            <textarea
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={patient.initialContext?.reasonForConsultation ?? ""}
              id="initialReason"
              name="initialReason"
              rows={2}
            />
          </div>
        </fieldset>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
