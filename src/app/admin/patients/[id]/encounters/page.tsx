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

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Visitas del paciente</h2>

        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

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
          <h2 className="mt-3 text-xl font-semibold text-slate-900">Visitas del paciente</h2>
          <p className="mt-2 text-sm text-slate-600">Paciente: {pageData.patient.fullName}</p>
        </div>
      </div>

      {pageData.activeEpisode ? (
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
