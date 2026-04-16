import Link from "next/link";

import { loadPatientsList } from "@/app/admin/patients/data";

const STATUS_LABELS = {
  preliminary: "Ficha preliminar",
  ready_to_start: "Listo para iniciar tratamiento",
  active_treatment: "Tratamiento activo",
} as const;

export default async function AdminPatientsPage() {
  const patients = await loadPatientsList();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pacientes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Lectura mínima del Slice 1 conectada vía repository + mapper + data loader.
          </p>
        </div>

        <Link
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          href="/admin/patients/new"
        >
          Nuevo paciente
        </Link>
      </div>

      <section className="mt-6 space-y-3">
        {patients.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            No hay pacientes para mostrar.
          </p>
        ) : (
          patients.map((patient) => (
            <article key={patient.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-slate-900">
                <Link className="hover:underline" href={`/admin/patients/${patient.id}`}>
                  {patient.fullName}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-slate-700">Estado: {STATUS_LABELS[patient.operationalStatus]}</p>
              <p className="text-sm text-slate-700">DNI: {patient.dni ?? "Sin DNI"}</p>
              <p className="text-sm text-slate-700">Teléfono: {patient.phone ?? "Sin teléfono"}</p>
            </article>
          ))
        )}
      </section>
    </section>
  );
}
