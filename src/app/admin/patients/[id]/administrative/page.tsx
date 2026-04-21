import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { PatientAdministrativeEditor } from "@/app/admin/patients/[id]/components/PatientAdministrativeEditor";
import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";

interface AdminPatientAdministrativePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPatientAdministrativePage({
  params,
}: AdminPatientAdministrativePageProps) {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href={`/admin/patients/${id}`}
      >
        ← Volver al paciente
      </Link>

      <header className="mt-3">
        <h1 className="text-xl font-semibold text-slate-900">
          Datos administrativos
        </h1>
        {patient ? (
          <p className="mt-1 text-sm text-slate-600">Paciente: {patient.fullName}</p>
        ) : null}
      </header>

      {patient ? (
        <div className="mt-4 space-y-6">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Datos administrativos
            </h2>
            <div className="mt-3">
              <PatientAdministrativeEditor patient={patient} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Gestión del tratamiento
            </h2>
            {patient.activeEpisode ? (
              <FinishEpisodeOfCareForm patient={patient} />
            ) : (
              <StartEpisodeOfCareForm patient={patient} />
            )}
          </section>
        </div>
      ) : (
        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      )}
    </section>
  );
}
