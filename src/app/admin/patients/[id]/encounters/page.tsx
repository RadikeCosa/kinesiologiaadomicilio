import type { Metadata } from "next";
import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { EncountersList } from "@/app/admin/patients/[id]/encounters/components/EncountersList";
import { EncounterStatsSummary } from "@/app/admin/patients/[id]/encounters/components/EncounterStatsSummary";
import { SuccessStatusMessage } from "@/app/admin/patients/[id]/encounters/components/SuccessStatusMessage";
import { FunctionalTrendSummary } from "@/app/admin/patients/[id]/encounters/components/FunctionalTrendSummary";
import { ClinicalCycleContextCard } from "@/app/admin/patients/[id]/encounters/components/ClinicalCycleContextCard";
import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
  formatDateDisplay,
  formatDniDisplay,
} from "@/lib/patient-admin-display";
import { PATIENT_SURFACE_COPY } from "@/app/admin/patients/[id]/patient-surface-copy";

interface AdminPatientEncountersPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ status?: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientEncountersPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return {
    title: patient ? `Gestión clínica — ${patient.fullName}` : "Gestión clínica",
  };
}

type TreatmentMetadata = {
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
      title: "Tratamiento activo",
      detail: `Inicio: ${formatDateDisplay(params.activeEpisodeStartDate)}`,
    };
  }

  if (params.latestEpisodeStatus === "finished") {
    return {
      title: "Tratamiento finalizado",
      detail: `Finalización: ${formatDateDisplay(params.latestEpisodeEndDate)}`,
    };
  }

  return {
    title: "Sin tratamiento iniciado",
    detail: "No hay un tratamiento iniciado para este paciente.",
  };
}

const ENCOUNTERS_STATUS_MESSAGES = {
  "treatment-started": "Tratamiento iniciado. Ya podés registrar visitas.",
  "encounter-created": "Visita registrada.",
} as const;

export default async function AdminPatientEncountersPage({ params, searchParams }: AdminPatientEncountersPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const pageData = await loadPatientEncountersPageData(id);
  const patientAge = pageData
    ? calculateAgeFromBirthDate(pageData.patient.birthDate)
    : null;
  const treatmentBadge = pageData
    ? getTreatmentBadgePresentation(pageData.patient.operationalStatus)
    : null;

  if (!pageData) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver a pacientes
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Gestión clínica</h2>

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
  const statusMessage = resolvedSearchParams?.status
    ? ENCOUNTERS_STATUS_MESSAGES[resolvedSearchParams.status as keyof typeof ENCOUNTERS_STATUS_MESSAGES]
    : undefined;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href={`/admin/patients/${pageData.patient.id}`}
      >
        ← Volver al paciente
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Gestión clínica</p>
            {treatmentBadge ? (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
              >
                {treatmentBadge.label}
              </span>
            ) : null}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestión clínica</h1>
            <p className="mt-1 text-base text-slate-700">{pageData.patient.fullName}</p>
          </div>
          <p className="text-sm text-slate-600">{PATIENT_SURFACE_COPY.clinicalDefinition}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pageData.activeEpisode ? (
            <Link
              className="inline-flex items-center justify-center rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              href={`/admin/patients/${pageData.patient.id}/encounters/new`}
            >
              Registrar visita
            </Link>
          ) : null}
        </div>
      </div>

      {statusMessage ? <SuccessStatusMessage message={statusMessage} /> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        {pageData.patient.dni ? <span>DNI: {formatDniDisplay(pageData.patient.dni)}</span> : null}
        {patientAge !== null ? <span>· Edad: {patientAge} años</span> : null}
        <span>· {treatmentMetadata.title}</span>
        <span>{treatmentMetadata.detail}</span>
      </div>

      {!pageData.activeEpisode ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span>
            {pageData.mostRecentEpisode?.status === "finished"
              ? "Tratamiento finalizado. Las visitas quedan disponibles como historial."
              : "No podés registrar visitas hasta tener un tratamiento activo."}
          </span>
          <Link
            className="inline-flex items-center justify-center rounded border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
            href={`/admin/patients/${pageData.patient.id}/treatment`}
          >
            Ir a gestión de tratamiento
          </Link>
        </div>
      ) : null}

      <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5" aria-label="Seguimiento rápido del ciclo">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-medium text-slate-900">Seguimiento rápido del ciclo</h2>
          <p className="mt-1 text-sm text-slate-600">
            Lectura rápida del tratamiento actual: contexto clínico, tendencia funcional y señales del ciclo completo.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <ClinicalCycleContextCard
            patientId={pageData.patient.id}
            activeEpisode={pageData.activeEpisode}
            mostRecentEpisode={pageData.mostRecentEpisode}
            clinicalContext={pageData.clinicalContext}
          />

          <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
            <EncounterStatsSummary stats={pageData.encounterStats} />
            <FunctionalTrendSummary trend={pageData.functionalTrend} />
          </div>
        </div>
      </section>

      <EncountersList
        encounters={pageData.encounters}
        hasActiveTreatment={Boolean(pageData.activeEpisode)}
        hasFinishedTreatment={pageData.mostRecentEpisode?.status === "finished"}
        patientId={pageData.patient.id}
      />
    </section>
  );
}
