import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Panel operativo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Usá estos accesos para gestionar pacientes y sostener el flujo diario de atención.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Listado de pacientes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Consultá estado de tratamiento y datos de contacto antes de entrar al detalle de cada caso.
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            href="/admin/patients"
          >
            Ir al listado
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Alta de paciente</h2>
          <p className="mt-2 text-sm text-slate-600">
            Registrá un nuevo paciente con los datos básicos para iniciar su seguimiento clínico.
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            href="/admin/patients/new"
          >
            Crear paciente
          </Link>
        </article>
      </section>
    </div>
  );
}
