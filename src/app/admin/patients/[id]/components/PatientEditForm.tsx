"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updatePatientAction } from "@/app/admin/patients/[id]/actions/update-patient.action";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface PatientEditFormProps {
  patient: PatientDetailReadModel;
  isEditing: boolean;
  onEditingChange: (nextValue: boolean) => void;
}

function hasSomeValue(values: Array<string | undefined>): boolean {
  return values.some(Boolean);
}

export function PatientEditForm({
  patient,
  isEditing,
  onEditingChange,
}: PatientEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!isEditing) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const mainContactName =
      String(formData.get("mainContactName") ?? "") || undefined;
    const mainContactRelationship =
      String(formData.get("mainContactRelationship") ?? "") || undefined;
    const mainContactPhone =
      String(formData.get("mainContactPhone") ?? "") || undefined;

    const input = {
      id: patient.id,
      dni: String(formData.get("dni") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      address: String(formData.get("address") ?? "") || undefined,
      mainContact: hasSomeValue([
        mainContactName,
        mainContactRelationship,
        mainContactPhone,
      ])
        ? {
            name: mainContactName,
            relationship: mainContactRelationship,
            phone: mainContactPhone,
          }
        : undefined,
    };

    startTransition(async () => {
      const result = await updatePatientAction(input);
      setMessage(
        result.message ??
          (result.ok ? "Paciente actualizado correctamente." : "Error."),
      );
      if (result.ok) {
        onEditingChange(false);
        router.refresh();
      }
    });
  }

  return (
    <section className="space-y-4" id="patient-edit-form">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Editar datos del paciente
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Actualizá identidad y contacto sin tocar el bloque clínico.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium" htmlFor="dni">
            DNI
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            defaultValue={patient.dni ?? ""}
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
            defaultValue={patient.phone ?? ""}
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
            defaultValue={patient.address ?? ""}
            id="address"
            name="address"
          />
        </div>

        <fieldset className="space-y-4 rounded border border-slate-200 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Contacto principal (opcional)
          </legend>
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="mainContactName"
            >
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
            <label
              className="block text-sm font-medium"
              htmlFor="mainContactRelationship"
            >
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
            <label
              className="block text-sm font-medium"
              htmlFor="mainContactPhone"
            >
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

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          className="ml-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          onClick={() => onEditingChange(false)}
          type="button"
        >
          Cancelar
        </button>
      </form>
    </section>
  );
}
