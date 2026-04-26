import type { Metadata } from "next";
import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { EncountersList } from "@/app/admin/patients/[id]/encounters/components/EncountersList";
import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
  formatDateDisplay,
  formatDniDisplay,
} from "@/lib/patient-admin-display";

interface AdminPatientEncountersPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientEncountersPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return {
    title: patient ? `Visitas — ${patient.fullName}` : "Visitas",
  };
}

type TreatmentMetadata = {
  toneClassName: string;
  title: string;
  detail: string;
};

function buildTreatmentMetadata(params: {
  activeEpisodeStartDate?: string;
  latestEpisodeStatus?: "active" | "finished";
  latestEpisodeEndDate?: string;
}): TreatmentMetadata {
  if (params.activeEpisodeStartDate) {
    return {
      toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
      title: "Tratamiento activo",
      detail: `Inicio: ${formatDateDisplay(params.activeEpisodeStartDate)}`,
    };
  }

  if (params.latestEpisodeStatus === "finished") {
    return {
      toneClassName: "border-slate-300 bg-slate-100 text-slate-800",
      title: "Tratamiento finalizado",
      detail: `Finalización: ${formatDateDisplay(params.latestEpisodeEndDate)}`,
    };
  }

  return {
    toneClassName: "border-amber-200 bg-amber-50 text-amber-900",
    title: "Sin tratamiento iniciado",
    detail: "Iniciá un tratamiento para habilitar el registro de visitas.",
  };
}

export default async function AdminPatientEncountersPage({ params }: AdminPatientEncountersPageProps) {
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

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Visitas del paciente</h2>

        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

  const treatmentMetadata = buildTreatmentMetadata({
    activeEpisodeStartDate: pageData.activeEpisode?.startDate,
    latestEpisodeStatus: pageData.mostRecentEpisode?.status,
    latestEpisodeEndDate: pageData.mostRecentEpisode?.endDate,
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href={`/admin/patients/${pageData.patient.id}`}
      >
        ← Volver al paciente
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">{pageData.patient.fullName}</h1>
          {treatmentBadge ? (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
            >
              {treatmentBadge.label}
            </span>
          ) : null}
        </div>
        {pageData.activeEpisode ? (
          <Link
            className="inline-flex items-center justify-center rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            href={`/admin/patients/${pageData.patient.id}/encounters/new`}
          >
            Registrar visita
          </Link>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-slate-600">Registro y seguimiento de visitas del paciente.</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        {patientDetail ? (
          <>
            <span>DNI: {formatDniDisplay(patientDetail.dni)}</span>
            {patientAge !== null ? <span>· Edad: {patientAge} años</span> : null}
          </>
        ) : null}
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${treatmentMetadata.toneClassName}`}>
          {treatmentMetadata.title}
        </span>
        <span>{treatmentMetadata.detail}</span>
      </div>

      {!pageData.activeEpisode ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span>Necesitás un tratamiento activo para registrar visitas.</span>
          <Link
            className="inline-flex items-center justify-center rounded border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
            href={`/admin/patients/${pageData.patient.id}/treatment`}
          >
            Ir a gestión de tratamiento
          </Link>
        </div>
      ) : null}

      <EncountersList
        encounters={pageData.encounters}
        hasActiveTreatment={Boolean(pageData.activeEpisode)}
        patientId={pageData.patient.id}
      />
    </section>
  );
}
