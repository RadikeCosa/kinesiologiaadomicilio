import type { Metadata } from "next";
import Link from "next/link";

import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";
import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
  formatDateDisplay,
  formatDniDisplay,
} from "@/lib/patient-admin-display";

interface AdminPatientTreatmentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientTreatmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return {
    title: patient ? `Tratamiento — ${patient.fullName}` : "Tratamiento",
  };
}

export default async function AdminPatientTreatmentPage({ params }: AdminPatientTreatmentPageProps) {
  const { id } = await params;
  const patient = await loadPatientDetail(id);
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;
  const treatmentBadge = patient
    ? getTreatmentBadgePresentation(patient.operationalStatus)
    : null;

  if (!patient) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver a pacientes
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Gestión de tratamiento</h2>

        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${patient.id}`}
        >
          ← Volver al paciente
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">{patient.fullName}</h1>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge?.className}`}
          >
            {treatmentBadge?.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">Inicio y cierre del tratamiento del paciente.</p>
        <p className="mt-1 text-xs text-slate-500">
          DNI: {formatDniDisplay(patient.dni)}
          {patientAge !== null ? ` · Edad: ${patientAge} años` : ""}
        </p>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {patient.activeEpisode ? (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Tratamiento activo
            </h2>
            <p className="mt-3 text-sm text-slate-700">Inicio: {formatDateDisplay(patient.activeEpisode.startDate)}</p>
            <div className="mt-4">
              <FinishEpisodeOfCareForm patient={patient} />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Sin tratamiento activo
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Iniciá un tratamiento para habilitar el registro de visitas.
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <StartEpisodeOfCareForm patient={patient} />
            </div>
          </>
        )}
      </section>
    </section>
  );
}
