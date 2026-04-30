import type { Metadata } from "next";
import Link from "next/link";

import { loadAdminDashboard } from "@/app/admin/data";

export const metadata: Metadata = {
  title: "Administración",
};

function formatMetricValue(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return String(value);
}

function formatCoverage(value: { numerator: number; denominator: number; percentage: number | null }): string {
  if (value.percentage === null) {
    return "—";
  }

  return `${value.numerator}/${value.denominator} (${value.percentage}%)`;
}

export default async function AdminHomePage() {
  const dashboard = await loadAdminDashboard();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Panel operativo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Resumen diario para priorizar la operación clínica.
        </p>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Resumen operativo
          </h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Pacientes totales</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{dashboard.operationalSummary.totalPatients}</p>
            </article>
            <article className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-700">En tratamiento</p>
              <p className="mt-1 text-lg font-semibold text-emerald-900">{dashboard.operationalSummary.activeTreatment}</p>
            </article>
            <article className="rounded-md border border-slate-300 bg-slate-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-700">Tratamiento finalizado</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{dashboard.operationalSummary.finishedTreatment}</p>
            </article>
            <article className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-700">Sin tratamiento iniciado</p>
              <p className="mt-1 text-lg font-semibold text-amber-900">{dashboard.operationalSummary.withoutStartedTreatment}</p>
            </article>
            <article className="rounded-md border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-wide text-sky-700">Solicitudes en evaluación</p>
              <p className="mt-1 text-lg font-semibold text-sky-900">{dashboard.serviceRequestSummary.inReview}</p>
            </article>
            <article className="rounded-md border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs uppercase tracking-wide text-indigo-700">Aceptadas pendientes de tratamiento</p>
              <p className="mt-1 text-lg font-semibold text-indigo-900">{dashboard.serviceRequestSummary.acceptedPendingTreatment}</p>
            </article>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Edad de pacientes en tratamiento
          </h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Menor edad</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatMetricValue(dashboard.ageSummary.youngest)}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Mayor edad</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatMetricValue(dashboard.ageSummary.oldest)}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Edad promedio</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatMetricValue(dashboard.ageSummary.average)}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Cobertura fecha de nacimiento</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatCoverage(dashboard.ageSummary.coverage)}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Con fecha válida</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{dashboard.ageSummary.withValidBirthDate}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Sin fecha válida</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{dashboard.ageSummary.withoutValidBirthDate}</p>
            </article>
          </div>

          <p className="mt-3 text-xs text-slate-600">{dashboard.ageSummary.note}</p>
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
