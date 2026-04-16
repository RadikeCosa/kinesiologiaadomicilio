import { loadPatientsList } from "@/app/admin/patients/data";

export default async function AdminPatientsPage() {
  const patients = await loadPatientsList();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Pacientes</h1>
      <p className="mt-2 text-sm text-gray-700">
        Esta pantalla es un placeholder del Slice 1 (Fase 1). El listado operativo se implementará en las
        próximas fases.
      </p>
      <p className="mt-4 text-sm text-gray-600">Pacientes cargados en placeholder: {patients.length}</p>
    </main>
  );
}
