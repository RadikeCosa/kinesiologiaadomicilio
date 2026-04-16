import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <section className="flex-1 bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
        <header className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Superficie privada</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Administración</h1>
          <p className="mt-2 text-sm text-slate-600">Flujo operativo mínimo para gestionar pacientes.</p>

          <nav aria-label="Navegación privada" className="mt-4 flex flex-wrap gap-2">
            <Link
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              href="/admin"
            >
              Inicio admin
            </Link>
            <Link
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              href="/admin/patients"
            >
              Pacientes
            </Link>
            <Link
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              href="/admin/patients/new"
            >
              Nuevo paciente
            </Link>
          </nav>
        </header>

        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
