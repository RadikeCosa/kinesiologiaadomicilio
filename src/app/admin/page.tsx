import Link from "next/link";

import { loadPatientsList } from "@/app/admin/patients/data";

export default async function AdminHomePage() {
  const patients = await loadPatientsList();

  const summary = {
    total: patients.length,
    activeTreatment: patients.filter((patient) => patient.operationalStatus === "active_treatment").length,
    readyToStart: patients.filter((patient) => patient.operationalStatus === "ready_to_start").length,
    preliminary: patients.filter((patient) => patient.operationalStatus === "preliminary").length,
    finishedTreatment: patients.filter((patient) => patient.operationalStatus === "finished_treatment").length,
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Panel operativo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Resumen rápido del estado de pacientes para priorizar la jornada.
        </p>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{summary.total}</p>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Activos</p>
          <p className="mt-1 text-lg font-semibold text-emerald-900">{summary.activeTreatment}</p>
        </article>
        <article className="rounded-lg border border-sky-200 bg-sky-50 p-3">
          <p className="text-xs uppercase tracking-wide text-sky-700">Listos</p>
          <p className="mt-1 text-lg font-semibold text-sky-900">{summary.readyToStart}</p>
        </article>
        <article className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs uppercase tracking-wide text-amber-700">Identidad incompleta</p>
          <p className="mt-1 text-lg font-semibold text-amber-900">{summary.preliminary}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-slate-100 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-600">Finalizados</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{summary.finishedTreatment}</p>
        </article>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          href="/admin/patients"
        >
          Ver pacientes
        </Link>
        <Link
          className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          href="/admin/patients/new"
        >
          Nuevo paciente
        </Link>
      </div>
    </section>
  );
}
