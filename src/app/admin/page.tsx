import type { Metadata } from "next";
import Link from "next/link";

import { loadAdminDashboard } from "@/app/admin/data";
import { buildAdminDashboardSections, type AdminDashboardMetricCard } from "@/app/admin/dashboard-metrics";

export const metadata: Metadata = {
  title: "Administración",
};

function formatMetricValue(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return String(value);
}

const METRIC_TONE_STYLES: Record<AdminDashboardMetricCard["tone"], string> = {
  sky: "border-sky-200 bg-sky-50",
  indigo: "border-indigo-200 bg-indigo-50",
  amber: "border-amber-200 bg-amber-50",
  emerald: "border-emerald-200 bg-emerald-50",
  slate: "border-slate-200 bg-white",
};

const METRIC_LABEL_STYLES: Record<AdminDashboardMetricCard["tone"], string> = {
  sky: "text-sky-700",
  indigo: "text-indigo-700",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
  slate: "text-slate-500",
};

const METRIC_VALUE_STYLES: Record<AdminDashboardMetricCard["tone"], string> = {
  sky: "text-sky-900",
  indigo: "text-indigo-900",
  amber: "text-amber-900",
  emerald: "text-emerald-900",
  slate: "text-slate-900",
};

function renderMetricCard(metric: AdminDashboardMetricCard) {
  return (
    <article className={`rounded-md border p-3 ${METRIC_TONE_STYLES[metric.tone]}`} key={metric.label}>
      <p className={`text-xs uppercase tracking-wide ${METRIC_LABEL_STYLES[metric.tone]}`}>{metric.label}</p>
      <p className={`mt-1 text-lg font-semibold ${METRIC_VALUE_STYLES[metric.tone]}`}>{metric.value}</p>
      {metric.helper ? (
        <p className="mt-2 text-xs text-slate-600">{metric.helper}</p>
      ) : null}
    </article>
  );
}

export default async function AdminHomePage() {
  const dashboard = await loadAdminDashboard();
  const sections = buildAdminDashboardSections(dashboard);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Panel operativo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Prioriza qué revisar hoy y qué está en seguimiento.
        </p>
      </header>

      <div className="mt-4 space-y-4">
        {sections.map((section) => {
          const hasVisibleMetrics = section.metrics.some((metric) => metric.value > 0);

          return (
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                {section.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{section.description}</p>

              {hasVisibleMetrics ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {section.metrics.map((metric) => renderMetricCard(metric))}
                </div>
              ) : section.emptyMessage ? (
                <p className="mt-3 rounded-md border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">
                  {section.emptyMessage}
                </p>
              ) : null}
            </article>
          );
        })}

        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Edad de pacientes
          </h2>
          <p className="mt-2 text-sm text-slate-600">Indicadores generales para lectura global.</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Paciente más joven</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatMetricValue(dashboard.ageSummary.youngest)}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Paciente más viejo</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatMetricValue(dashboard.ageSummary.oldest)}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Promedio de edad</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatMetricValue(dashboard.ageSummary.average)}</p>
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
