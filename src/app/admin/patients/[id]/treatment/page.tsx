import Link from "next/link";

import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";
import { loadPatientDetail } from "@/app/admin/patients/[id]/data";

interface AdminPatientTreatmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPatientTreatmentPage({ params }: AdminPatientTreatmentPageProps) {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  if (!patient) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver al listado
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Gestión clínica · Tratamiento</h2>

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
          href={`/admin/patients/${patient.id}/encounters`}
        >
          ← Volver a gestión clínica
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">{patient.fullName}</h1>
        <p className="mt-2 text-sm text-slate-600">Gestión clínica · Tratamiento</p>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {patient.activeEpisode ? (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Tratamiento activo
            </h2>
            <p className="mt-3 text-sm text-slate-700">Inicio: {patient.activeEpisode.startDate}</p>
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
              Iniciá un EpisodeOfCare para habilitar el registro de visitas en gestión clínica.
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
