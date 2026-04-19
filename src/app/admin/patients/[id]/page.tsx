import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { PatientDetailView } from "@/app/admin/patients/[id]/components/PatientDetailView";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";
import { PatientManagementPanel } from "@/app/admin/patients/[id]/components/PatientManagementPanel";

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
        <h1 className="text-xl font-semibold text-slate-900">
          {patient?.fullName ?? "Paciente no encontrado"}
        </h1>
        {patient ? (
          <Link
            className="inline-flex rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            href={`/admin/patients/${patient.id}/encounters`}
          >
            Ver visitas
          </Link>
        ) : null}
      </header>

      {patient ? <PatientManagementPanel patient={patient} /> : null}

      <PatientDetailView patient={patient} />

      {patient && !patient.activeEpisode ? <StartEpisodeOfCareForm patient={patient} /> : null}
    </section>
  );
}
