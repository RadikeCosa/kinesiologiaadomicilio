import { PatientCreateForm } from "@/app/admin/patients/new/components/PatientCreateForm";

export default function AdminNewPatientPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Nuevo paciente</h1>
      <p className="mt-2 text-sm text-gray-700">
        Alta mínima de paciente preparada como base del Slice 1 (Fase 1).
      </p>
      <PatientCreateForm />
    </main>
  );
}
