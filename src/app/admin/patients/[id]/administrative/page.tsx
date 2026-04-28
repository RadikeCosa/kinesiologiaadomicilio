import type { Metadata } from "next";
import Link from "next/link";

import { PatientAdministrativeEditor } from "@/app/admin/patients/[id]/components/PatientAdministrativeEditor";
import { PatientServiceRequestsSection } from "@/app/admin/patients/[id]/administrative/components/PatientServiceRequestsSection";
import { loadPatientAdministrativeContext } from "@/app/admin/patients/[id]/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
  formatDniDisplay,
} from "@/lib/patient-admin-display";

interface AdminPatientAdministrativePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientAdministrativePageProps): Promise<Metadata> {
  const { id } = await params;
  const { patient } = await loadPatientAdministrativeContext(id);

  return {
    title: patient
      ? `Datos administrativos — ${patient.fullName}`
      : "Datos administrativos",
  };
}

export default async function AdminPatientAdministrativePage({
  params,
}: AdminPatientAdministrativePageProps) {
  const { id } = await params;
  const { patient, serviceRequests } = await loadPatientAdministrativeContext(id);
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;
  const treatmentBadge = patient
    ? getTreatmentBadgePresentation(patient.operationalStatus)
    : null;
  const hasActiveTreatment = Boolean(patient?.activeEpisode);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <header>
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${id}`}
        >
          ← Volver al paciente
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">
          Administración del paciente
        </h1>
        {patient ? (
          <p className="mt-1 text-sm text-slate-600">
            Gestión administrativa de identidad y contacto de{" "}
            {patient.fullName}
          </p>
        ) : null}
      </header>

      {patient ? (
        <>
          <header className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                {patient.fullName}
              </h1>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge?.className}`}
              >
                {treatmentBadge?.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              DNI: {formatDniDisplay(patient.dni)}
              {patientAge !== null ? ` · Edad: ${patientAge} años` : ""}
            </p>
          </header>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              href={`/admin/patients/${patient.id}/treatment`}
            >
              Gestión de tratamiento
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              href={`/admin/patients/${patient.id}/encounters`}
            >
              Ver visitas
            </Link>
            {hasActiveTreatment ? (
              <span className="text-xs text-slate-500">
                Esta pantalla no reemplaza la gestión clínica del tratamiento o visitas.
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Resumen administrativo
              </h2>
              <div className="mt-3">
                <PatientAdministrativeEditor patient={patient} />
              </div>
            </section>
          </div>
          <PatientServiceRequestsSection patientId={patient.id} serviceRequests={serviceRequests} />
        </>
      ) : (
        <>
          <Link
            className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
            href="/admin/patients"
          >
            ← Volver a pacientes
          </Link>
          <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            No se encontró el paciente solicitado.
          </p>
        </>
      )}
    </section>
  );
}
