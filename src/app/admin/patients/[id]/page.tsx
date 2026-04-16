import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { PatientDetailView } from "@/app/admin/patients/[id]/components/PatientDetailView";
import { PatientEditForm } from "@/app/admin/patients/[id]/components/PatientEditForm";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";

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

      <h2 className="mt-3 text-xl font-semibold text-slate-900">Paciente</h2>
      <p className="mt-2 text-sm text-slate-600">
        Flujo mínimo usable: detalle, edición incremental e inicio de tratamiento por separado.
      </p>

      <PatientDetailView patient={patient} />

      {patient ? (
        <>
          <PatientEditForm patient={patient} />
          <StartEpisodeOfCareForm patient={patient} />
        </>
      ) : null}
    </section>
  );
}
