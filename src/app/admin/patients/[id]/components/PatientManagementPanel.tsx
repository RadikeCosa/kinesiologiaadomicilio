"use client";

import { useState } from "react";
import Link from "next/link";

import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { PatientEditForm } from "@/app/admin/patients/[id]/components/PatientEditForm";
import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";

interface PatientManagementPanelProps {
  patient: PatientDetailReadModel;
}

export function PatientManagementPanel({ patient }: PatientManagementPanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="mt-3 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Gestión del paciente</h2>
          <p className="mt-1 text-xs text-slate-600">
            Unificá las acciones administrativas y de tratamiento activo en un único contexto de trabajo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => setIsEditing((currentValue) => !currentValue)}
            type="button"
          >
            {isEditing ? "Ocultar edición administrativa" : "Editar datos administrativos"}
          </button>
          <Link
            className="inline-flex rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            href={`/admin/patients/${patient.id}/encounters`}
          >
            Ver visitas
          </Link>
        </div>
      </div>

      {patient.activeEpisode ? (
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Tratamiento activo</h3>
          <p className="mt-1 text-xs text-slate-600">
            Acción operativa separada del formulario administrativo.
          </p>
          <FinishEpisodeOfCareForm patient={patient} />
        </div>
      ) : null}

      <PatientEditForm
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        patient={patient}
      />
    </section>
  );
}
