"use client";

import { useState } from "react";

import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { PatientEditForm } from "@/app/admin/patients/[id]/components/PatientEditForm";
import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";

interface PatientManagementPanelProps {
  patient: PatientDetailReadModel;
}

export function PatientManagementPanel({
  patient,
}: PatientManagementPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="mt-3 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium text-slate-900">
            Gestión del paciente
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Acciones administrativas y de tratamiento activo en un único
            contexto de trabajo.
          </p>
        </div>
        <button
          aria-expanded={isExpanded}
          className="inline-flex rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          type="button"
        >
          {isExpanded ? "Ocultar gestión" : "Mostrar gestión"}
        </button>
      </div>

      {isExpanded ? (
        <>
          <button
            className="inline-flex rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => setIsEditing((currentValue) => !currentValue)}
            type="button"
          >
            {isEditing
              ? "Ocultar edición administrativa"
              : "Editar datos administrativos"}
          </button>

          {isEditing ? (
            <div className="border-t border-slate-200 pt-4">
              <PatientEditForm
                isEditing={isEditing}
                onEditingChange={setIsEditing}
                patient={patient}
              />
            </div>
          ) : null}

          {patient.activeEpisode ? (
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Tratamiento activo
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Acción operativa separada del formulario administrativo.
              </p>
              <FinishEpisodeOfCareForm patient={patient} />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
