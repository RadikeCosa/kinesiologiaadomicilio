import type { Metadata } from "next";
import Link from "next/link";

import { loadAdminDashboard } from "@/app/admin/data";
import { buildAdminDashboardSections, type AdminDashboardMetricCard } from "@/app/admin/dashboard-metrics";

export const metadata: Metadata = {
  title: "Administración",
};

type AdminDashboardData = Awaited<ReturnType<typeof loadAdminDashboard>>;

function formatMetricValue(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return String(value);
}

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExecutiveSummary(dashboard: AdminDashboardData): string {
  const reviewCount = dashboard.serviceRequestSummary.inReview + dashboard.serviceRequestSummary.acceptedPendingTreatment;

  if (reviewCount > 0) {
    return `Hoy hay ${dashboard.operationalSummary.activeTreatment} tratamientos activos, ${dashboard.operationalSummary.readyToStart} inicios para preparar y ${reviewCount} pendientes administrativos por revisar.`;
  }

  if (dashboard.operationalSummary.preliminary > 0) {
    return `Hoy hay ${dashboard.operationalSummary.activeTreatment} tratamientos activos, ${dashboard.operationalSummary.readyToStart} inicios para preparar y ${dashboard.operationalSummary.preliminary} pacientes con datos por completar.`;
  }

  return `Hoy hay ${dashboard.operationalSummary.activeTreatment} tratamientos activos y ${dashboard.operationalSummary.readyToStart} inicios para preparar.`;
}

function formatExecutiveLabel(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function getVisibleMetrics(metrics: AdminDashboardMetricCard[]): AdminDashboardMetricCard[] {
  const hasPositiveMetric = metrics.some((metric) => metric.value > 0);

  if (!hasPositiveMetric) {
    return [];
  }

  return metrics.filter((metric) => metric.value > 0);
}

const LIGHT_CARD_TONE_STYLES: Record<AdminDashboardMetricCard["tone"], string> = {
  sky: "bg-sky-50 text-sky-950 ring-sky-100",
  indigo: "bg-indigo-50 text-indigo-950 ring-indigo-100",
  amber: "bg-amber-50 text-amber-950 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-950 ring-emerald-100",
  slate: "bg-slate-100 text-slate-950 ring-slate-200",
};

const LIGHT_LABEL_TONE_STYLES: Record<AdminDashboardMetricCard["tone"], string> = {
  sky: "text-sky-700",
  indigo: "text-indigo-700",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
  slate: "text-slate-600",
};

function renderDecisionMetricCard(metric: AdminDashboardMetricCard) {
  const cardToneStyles = LIGHT_CARD_TONE_STYLES;
  const labelToneStyles = LIGHT_LABEL_TONE_STYLES[metric.tone];

  return (
    <article
      className={`rounded-[24px] p-5 ring-1 ${cardToneStyles[metric.tone]}`}
      data-metric-card={toSlug(metric.label)}
      key={metric.label}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${labelToneStyles}`}>{metric.label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{metric.value}</p>
      {metric.helper ? (
        <p className="mt-3 max-w-xs text-sm text-slate-600">
          {metric.helper}
        </p>
      ) : null}
      {metric.href && metric.ctaLabel ? (
        <div className="mt-5">
          <Link
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            href={metric.href}
          >
            {metric.ctaLabel}
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function renderContextMetric(metric: AdminDashboardMetricCard) {
  return (
    <article
      className="flex items-start justify-between gap-4 rounded-2xl bg-white/88 px-4 py-4 ring-1 ring-slate-200"
      data-metric-card={toSlug(metric.label)}
      key={metric.label}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
        {metric.helper ? (
          <p className="mt-2 max-w-xs text-sm text-slate-600">{metric.helper}</p>
        ) : null}
        {metric.href && metric.ctaLabel ? (
          <div className="mt-3">
            <Link
              className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
              href={metric.href}
            >
              {metric.ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>

      <p className="shrink-0 text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
    </article>
  );
}

export default async function AdminHomePage() {
  const dashboard = await loadAdminDashboard();
  const sections = buildAdminDashboardSections(dashboard);
  const actionSection = sections.find((section) => section.title === "Prioridad operativa");
  const trackingSection = sections.find((section) => section.title === "En seguimiento");
  const contextSection = sections.find((section) => section.title === "Contexto / histórico");

  const executiveSummary = buildExecutiveSummary(dashboard);
  const executiveMetrics = [
    {
      label: "En tratamiento",
      value: formatExecutiveLabel(dashboard.operationalSummary.activeTreatment, "paciente", "pacientes"),
      accentClassName: "text-emerald-700",
    },
    {
      label: "Preparar inicio",
      value: formatExecutiveLabel(dashboard.operationalSummary.readyToStart, "paciente", "pacientes"),
      accentClassName: "text-slate-950",
    },
    {
      label: "Pendientes administrativos",
      value: formatExecutiveLabel(
        dashboard.serviceRequestSummary.inReview + dashboard.serviceRequestSummary.acceptedPendingTreatment,
        "pendiente",
        "pendientes",
      ),
      accentClassName: "text-sky-700",
    },
    {
      label: "Faltan datos",
      value: formatExecutiveLabel(dashboard.operationalSummary.preliminary, "paciente", "pacientes"),
      accentClassName: "text-amber-700",
    },
  ];

  const actionMetrics = actionSection ? getVisibleMetrics(actionSection.metrics) : [];
  const trackingMetrics = trackingSection ? getVisibleMetrics(trackingSection.metrics) : [];
  const contextMetrics = contextSection ? getVisibleMetrics(contextSection.metrics) : [];

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.65)]">
        <div className="grid gap-8 bg-white px-6 py-7 text-slate-950 ring-1 ring-slate-200 lg:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.95fr)] lg:px-8 lg:py-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Consola operativa privada
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Administración clínica
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-700 sm:text-lg">
              Decidí qué destrabar hoy, qué casos seguir de cerca y qué contexto conviene tener a mano sin salir de la consola.
            </p>
            <p className="mt-5 max-w-2xl text-sm text-slate-600 sm:text-base">
              {executiveSummary}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                Estado operativo de hoy
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                {dashboard.operationalSummary.activeTreatment} activos
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
                {dashboard.serviceRequestSummary.inReview + dashboard.serviceRequestSummary.acceptedPendingTreatment} pendientes administrativos
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {dashboard.operationalSummary.withoutStartedTreatment} sin tratamiento iniciado
              </span>
            </div>
          </div>

          <aside className="flex h-full flex-col justify-between rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Acciones principales
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Entradas rápidas para continuar la operación sin pasar por vistas intermedias.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                href="/admin/requests/new"
              >
                Nueva solicitud de atención
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
                href="/admin/patients"
              >
                Ver pacientes
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
                href="/admin/patients/new"
              >
                Nuevo paciente
              </Link>
            </div>
          </aside>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          {executiveMetrics.map((metric) => (
            <article
              className="bg-white px-6 py-5"
              data-metric-card={toSlug(metric.label)}
              key={metric.label}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
              <p className={`mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl ${metric.accentClassName}`}>
                {metric.value}
              </p>
            </article>
          ))}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.95fr)]">
        <div className="space-y-6">
          {actionSection ? (
            <section
              className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 sm:p-7"
              data-dashboard-section="prioridad-operativa"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Prioridad operativa
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Qué destrabar hoy
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 sm:text-base">
                    Pendientes que requieren decisión o que están frenando el avance de pacientes y tratamientos.
                  </p>
                </div>

                {actionMetrics.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {actionMetrics.length} focos activos
                  </span>
                ) : null}
              </div>

              {actionMetrics.length > 0 ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {actionMetrics.map((metric) => renderDecisionMetricCard(metric))}
                </div>
              ) : (
                <p className="mt-6 rounded-[24px] bg-slate-100 px-5 py-4 text-sm text-slate-700">
                  {actionSection.emptyMessage ?? "No hay pendientes críticos en este momento."}
                </p>
              )}
            </section>
          ) : null}

          {trackingSection ? (
            <section
              className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200 sm:p-7"
              data-dashboard-section="en-seguimiento"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    En seguimiento
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Casos que conviene tener cerca
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 sm:text-base">
                    Tratamientos activos y pacientes listos para el siguiente movimiento operativo.
                  </p>
                </div>

                {trackingMetrics.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {trackingMetrics.length} señales visibles
                  </span>
                ) : null}
              </div>

              {trackingMetrics.length > 0 ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {trackingMetrics.map((metric) => renderDecisionMetricCard(metric))}
                </div>
              ) : (
                <p className="mt-6 rounded-[24px] bg-slate-100 px-5 py-4 text-sm text-slate-700">
                  {trackingSection.emptyMessage ?? "No hay tratamientos activos para seguir hoy."}
                </p>
              )}
            </section>
          ) : null}
        </div>

        <aside
          className="rounded-[32px] bg-slate-100/95 p-6 ring-1 ring-slate-200 sm:p-7"
          data-dashboard-section="contexto-historico"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Contexto / histórico
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Lectura global
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Volumen general y referencias rápidas para entender el momento operativo sin cargar la vista principal.
          </p>

          {contextMetrics.length > 0 ? (
            <div className="mt-6 space-y-3">
              {contextMetrics.map((metric) => renderContextMetric(metric))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl bg-white/88 px-5 py-4 text-sm text-slate-700 ring-1 ring-slate-200">
              Todavía no hay contexto histórico suficiente para mostrar en esta vista.
            </p>
          )}

          <div className="mt-8 rounded-[28px] bg-white/80 p-5 ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Edad de pacientes
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Referencia secundaria calculada sobre pacientes con tratamiento iniciado o finalizado.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <article className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Paciente más joven</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {formatMetricValue(dashboard.ageSummary.youngest)}
                </p>
              </article>
              <article className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Paciente más viejo</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {formatMetricValue(dashboard.ageSummary.oldest)}
                </p>
              </article>
              <article className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Promedio de edad</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {formatMetricValue(dashboard.ageSummary.average)}
                </p>
              </article>
            </div>

            <p className="mt-4 text-xs text-slate-500">{dashboard.ageSummary.note}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
