import Link from "next/link";

export default function AdminHomePage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
      <p className="mt-2 text-sm text-slate-600">Elegí una acción para continuar en el módulo privado.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
          href="/admin/patients"
        >
          Ver pacientes
        </Link>
        <Link
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
          href="/admin/patients/new"
        >
          Nuevo paciente
        </Link>
      </div>
    </section>
  );
}
