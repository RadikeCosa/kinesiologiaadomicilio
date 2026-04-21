import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { PatientDetailView } from "@/app/admin/patients/[id]/components/PatientDetailView";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";
import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";

const OPERATIONAL_STATUS_LABELS = {
  preliminary: "Identidad incompleta",
  ready_to_start: "Listo para iniciar tratamiento",
  active_treatment: "Tratamiento activo",
  finished_treatment: "Tratamiento finalizado",
} as const;

interface AdminPatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPatientDetailPage({ params }: AdminPatientDetailPageProps) {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
        ← Volver al listado
      </Link>

      <header className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{patient?.fullName ?? "Paciente no encontrado"}</h1>
      </header>

      {patient ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Estado actual</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-800">{OPERATIONAL_STATUS_LABELS[patient.operationalStatus]}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                patient.activeEpisode
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {patient.activeEpisode ? "En tratamiento" : "Sin tratamiento activo"}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PatientDetailView patient={patient} />
        </div>

        {patient ? (
          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-900">Acciones contextuales</h2>
              <div className="mt-3 space-y-2">
                <Link
                  className="inline-flex w-full justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  href={`/admin/patients/${patient.id}/encounters`}
                >
                  Ver visitas
                </Link>
                <Link
                  className="inline-flex w-full justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  href={`/admin/patients/${patient.id}/administrative`}
                >
                  Editar datos administrativos
                </Link>
              </div>
            </section>

            {patient.activeEpisode ? (
              <FinishEpisodeOfCareForm patient={patient} />
            ) : (
              <StartEpisodeOfCareForm patient={patient} />
            )}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
