import type { Metadata } from "next";
import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { EncounterCreateForm } from "@/app/admin/patients/[id]/encounters/components/EncounterCreateForm";
import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
  formatDateDisplay,
  formatDniDisplay,
} from "@/lib/patient-admin-display";

interface AdminPatientEncounterCreatePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientEncounterCreatePageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return {
    title: patient ? `Registrar visita — ${patient.fullName}` : "Registrar visita",
  };
}

export default async function AdminPatientEncounterCreatePage({ params }: AdminPatientEncounterCreatePageProps) {
  const { id } = await params;
  const pageData = await loadPatientEncountersPageData(id);
  const patientDetail = pageData ? await loadPatientDetail(id) : null;
  const patientAge = patientDetail
    ? calculateAgeFromBirthDate(patientDetail.birthDate)
    : null;
  const treatmentBadge = patientDetail
    ? getTreatmentBadgePresentation(patientDetail.operationalStatus)
    : null;

  if (!pageData) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver a pacientes
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Registrar visita</h2>

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
          href={`/admin/patients/${pageData.patient.id}/encounters`}
        >
          ← Volver a visitas
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">{pageData.patient.fullName}</h1>
          {treatmentBadge ? (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
            >
              {treatmentBadge.label}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-slate-600">Completá la fecha y hora de la visita realizada.</p>
        {patientDetail ? (
          <p className="mt-1 text-xs text-slate-500">
            DNI: {formatDniDisplay(patientDetail.dni)}
            {patientAge !== null ? ` · Edad: ${patientAge} años` : ""}
            {pageData.activeEpisode?.startDate
              ? ` · Tratamiento activo desde ${formatDateDisplay(pageData.activeEpisode.startDate)}`
              : ""}
          </p>
        ) : null}
      </div>

      <EncounterCreateForm
        activeEpisodeId={pageData.activeEpisode?.id ?? null}
        patientId={pageData.patient.id}
        successRedirectPath={`/admin/patients/${pageData.patient.id}/encounters`}
        treatmentHref={`/admin/patients/${pageData.patient.id}/treatment`}
      />
    </section>
  );
}
