import type { Metadata } from "next";
import Link from "next/link";

import { RequestIntakeForm } from "@/app/admin/requests/new/components/RequestIntakeForm";

export const metadata: Metadata = {
  title: "Nueva solicitud de atención",
};

export default function AdminNewRequestPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin">
        ← Volver a administración
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-slate-900">Nueva solicitud de atención</h1>
      <p className="mt-2 text-sm text-slate-600">
        Registrá la consulta inicial y definí luego si avanza a tratamiento.
      </p>
      <RequestIntakeForm />
    </section>
  );
}
