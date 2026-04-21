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
      <header>
        <h1 className="text-xl font-semibold text-slate-900">
          Administración del paciente
        </h1>
        {patient ? (
          <p className="mt-1 text-sm text-slate-600">
            Gestión operativa y actualización de identidad/contacto de{" "}
            {patient.fullName}
          </p>
        ) : null}
      </header>

      {patient ? (
        <div className="mt-5 space-y-5">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Gestión del tratamiento
            </h2>
            <div className="mt-3">
              {patient.activeEpisode ? (
                <FinishEpisodeOfCareForm patient={patient} />
              ) : (
                <StartEpisodeOfCareForm patient={patient} />
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Datos de identidad y contacto
            </h2>
            <div className="mt-3">
              <PatientAdministrativeEditor patient={patient} />
            </div>
          </section>
        </div>
      ) : (
        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      )}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${id}`}
        >
          ← Volver al paciente
        </Link>
      </div>
    </section>
  );
}
