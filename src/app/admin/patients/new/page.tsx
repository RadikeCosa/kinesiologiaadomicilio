import type { Metadata } from "next";
import Link from "next/link";

import { PatientCreateForm } from "@/app/admin/patients/new/components/PatientCreateForm";

export const metadata: Metadata = {
  title: "Nuevo paciente",
};

export default function AdminNewPatientPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
        ← Volver a pacientes
      </Link>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">Nuevo paciente</h2>
      <p className="mt-2 text-sm text-slate-600">
        Completá los datos iniciales del paciente. El inicio del tratamiento se realiza en un paso separado.
      </p>
      <PatientCreateForm />
    </section>
  );
}
