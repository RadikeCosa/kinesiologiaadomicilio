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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Paciente</h1>
      <p className="mt-2 text-sm text-gray-700">Detalle cargado desde loader route-local (data.ts).</p>

      <PatientDetailView patient={patient} />

      {patient ? (
        <section className="mt-6 rounded border border-gray-200 p-4 text-sm text-gray-700">
          <p>DNI: {patient.dni ?? "Sin DNI"}</p>
          <p>Estado operativo: {patient.operationalStatus}</p>
          <p>Episodio activo: {patient.activeEpisode ? "Sí" : "No"}</p>
        </section>
      ) : null}

      <PatientEditForm />
      <StartEpisodeOfCareForm />
    </main>
  );
}
