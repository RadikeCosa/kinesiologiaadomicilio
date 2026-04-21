import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { PatientAdministrativeEditor } from "@/app/admin/patients/[id]/components/PatientAdministrativeEditor";

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
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <PatientAdministrativeEditor patient={patient} />
        </div>
      ) : (
        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      )}
    </section>
  );
}
