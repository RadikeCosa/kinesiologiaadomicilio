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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Pacientes</h1>
      <p className="mt-2 text-sm text-gray-700">
        Lectura mínima del Slice 1 conectada vía repository + mapper + data loader.
      </p>

      <section className="mt-6 space-y-3">
        {patients.length === 0 ? (
          <p className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-700">
            No hay pacientes para mostrar.
          </p>
        ) : (
          patients.map((patient) => (
            <article key={patient.id} className="rounded border border-gray-200 p-4">
              <h2 className="text-base font-medium">
                <Link className="hover:underline" href={`/admin/patients/${patient.id}`}>
                  {patient.fullName}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-gray-600">Estado: {STATUS_LABELS[patient.operationalStatus]}</p>
              <p className="text-sm text-gray-600">DNI: {patient.dni ?? "Sin DNI"}</p>
              <p className="text-sm text-gray-600">Teléfono: {patient.phone ?? "Sin teléfono"}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
