"use client";

import React from "react";
import { useState } from "react";

import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { MapsLinkAction } from "@/app/admin/patients/components/MapsLinkAction";
import { PhoneContactBlock } from "@/app/admin/patients/components/PhoneContactBlock";
import { PatientEditForm } from "@/app/admin/patients/[id]/components/PatientEditForm";
import { buildGoogleMapsSearchHref, formatAddressDisplay } from "@/lib/patient-contact-links";
import {
  calculateAgeFromBirthDate,
  formatContactRelationshipLabel,
  formatDateDisplay,
  formatDniDisplay,
  formatGenderLabel,
} from "@/lib/patient-admin-display";

interface PatientAdministrativeEditorProps {
  patient: PatientDetailReadModel;
  initialEditing?: boolean;
}

export function PatientAdministrativeEditor({
  patient,
  initialEditing = false,
}: PatientAdministrativeEditorProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const mapsHref = buildGoogleMapsSearchHref(patient.address);
  const addressLabel = formatAddressDisplay(patient.address);
  const age = calculateAgeFromBirthDate(patient.birthDate);

  if (isEditing) {
    return (
      <PatientEditForm
        isEditing
        onEditingChange={setIsEditing}
        patient={patient}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">
          Datos administrativos y de contacto
        </h3>
        <button
          className="inline-flex items-center justify-center rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={() => setIsEditing(true)}
          type="button"
        >
          Editar datos
        </button>
      </div>

      <dl className="grid gap-3 text-sm text-slate-800 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            DNI
          </dt>
          <dd className="mt-1">{formatDniDisplay(patient.dni)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Fecha de nacimiento
          </dt>
          <dd className="mt-1">{patient.birthDate ? formatDateDisplay(patient.birthDate) : "No informada"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Edad
          </dt>
          <dd className="mt-1">{age !== null ? `${age} años` : "No informada"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Género
          </dt>
          <dd className="mt-1">{formatGenderLabel(patient.gender)}</dd>
        </div>
      </dl>

      <section className="rounded-md border border-slate-300 bg-white p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900">
          Datos del paciente
        </h4>
        <div className="mt-2">
          <PhoneContactBlock
            phone={patient.phone}
            entity="patient"
            allowMainContactFallback={false}
            phoneLabel="Teléfono del paciente"
          />
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Dirección
        </h4>
        <p className="mt-2 text-sm text-slate-700">{addressLabel === "Sin dirección" ? "No informada" : addressLabel}</p>
        {mapsHref ? (
          <MapsLinkAction
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
            href={mapsHref}
          />
        ) : null}
      </section>

      <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Contacto principal
        </h4>
        <dl className="mt-2 space-y-1.5 text-sm text-slate-800">
          <div>
            <dt className="font-medium">Nombre</dt>
            <dd>{patient.mainContact?.name ?? "No informado"}</dd>
          </div>
          <div>
            <dt className="font-medium">Vínculo</dt>
            <dd>{formatContactRelationshipLabel(patient.mainContact?.relationship)}</dd>
          </div>
        </dl>
        <div className="mt-2">
          <PhoneContactBlock
            phone={patient.mainContact?.phone}
            entity="mainContact"
            phoneLabel="Teléfono del contacto principal"
          />
        </div>
      </section>

    </section>
  );
}
