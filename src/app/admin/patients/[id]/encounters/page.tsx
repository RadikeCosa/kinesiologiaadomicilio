import Link from "next/link";

import { EncounterCreateForm } from "@/app/admin/patients/[id]/encounters/components/EncounterCreateForm";
import { EncountersList } from "@/app/admin/patients/[id]/encounters/components/EncountersList";
import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";

interface AdminPatientEncountersPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPatientEncountersPage({ params }: AdminPatientEncountersPageProps) {
  const { id } = await params;
  const pageData = await loadPatientEncountersPageData(id);

  if (!pageData) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver al listado
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Gestión clínica</h2>

        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

  const hasActiveEpisode = Boolean(pageData.activeEpisode);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
            href={`/admin/patients/${pageData.patient.id}`}
          >
            ← Volver al paciente
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">{pageData.patient.fullName}</h1>
          <p className="mt-2 text-sm text-slate-600">Gestión clínica</p>
        </div>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Gestión del tratamiento
        </h2>

        {hasActiveEpisode ? (
          <p className="mt-3 text-sm text-slate-700">
            Tratamiento activo desde {pageData.activeEpisode?.startDate}. Podés cerrar este EpisodeOfCare cuando corresponda.
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-700">
            No hay tratamiento activo. Iniciá un EpisodeOfCare para habilitar el registro de visitas.
          </p>
        )}

        <Link
          className="mt-4 inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          href={`/admin/patients/${pageData.patient.id}/treatment`}
        >
          {hasActiveEpisode ? "Gestionar tratamiento activo" : "Iniciar tratamiento"}
        </Link>
      </section>

      <h2 className="mt-6 text-lg font-semibold text-slate-900">Visitas del paciente</h2>

      {hasActiveEpisode ? (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Tratamiento activo detectado. Ya podés registrar visitas realizadas.
        </div>
      ) : (
        <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Este paciente no tiene tratamiento activo. No se pueden registrar visitas hasta iniciar un EpisodeOfCare.
        </div>
      )}

      <EncounterCreateForm patientId={pageData.patient.id} activeEpisodeId={pageData.activeEpisode?.id ?? null} />
      <EncountersList encounters={pageData.encounters} />
    </section>
  );
}
