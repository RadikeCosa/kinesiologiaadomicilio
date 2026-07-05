import type { Metadata } from "next";
import Link from "next/link";

import { PatientsFiltersPanel } from "@/app/admin/patients/components/PatientsFiltersPanel";
import { PhoneContactActions } from "@/app/admin/patients/components/PhoneContactActions";
import { loadPatientsListWithOperationalSignals } from "@/app/admin/patients/data";
import { getPatientListActions } from "@/app/admin/patients/patient-list-actions";
import {
  buildGoogleMapsSearchHref,
  formatAddressDisplay,
} from "@/lib/patient-contact-links";
import {
  formatDniDisplay,
  formatPhoneDisplay,
} from "@/lib/patient-admin-display";
import type { PatientOperationalStatus } from "@/domain/patient/patient.types";

import { getTreatmentBadgePresentation } from "./treatment-badge";

export const metadata: Metadata = {
  title: "Pacientes",
};

type PatientsStatusFilter =
  | "active"
  | "pending"
  | "preliminary"
  | "ready_to_start"
  | "finished"
  | "all";

type PatientsStatusFilterAlias =
  | "active_treatment"
  | "finished_treatment";

interface AdminPatientsPageProps {
  searchParams?: Promise<{ status?: string | string[] }>;
}

function buildPatientsStatusHref(status?: PatientsStatusFilter): string {
  const searchParams = new URLSearchParams();

  if (status && status !== "active") {
    searchParams.set("status", status);
  }

  const search = searchParams.toString();

  return search ? `/admin/patients?${search}` : "/admin/patients";
}

const STATUS_FILTERS: Array<{
  value: PatientsStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  {
    value: "active",
    label: "En tratamiento",
  },
  {
    value: "preliminary",
    label: "Faltan datos",
  },
  {
    value: "ready_to_start",
    label: "Preparar inicio",
  },
  {
    value: "finished",
    label: "Finalizados",
  },
];

const EMPTY_STATE_BY_FILTER: Record<PatientsStatusFilter, string> = {
  active: "No hay pacientes en tratamiento.",
  pending: "No hay pacientes sin tratamiento activo.",
  preliminary: "No hay pacientes con datos pendientes para iniciar.",
  ready_to_start: "No hay pacientes en preparación de inicio.",
  finished: "No hay pacientes con tratamiento finalizado.",
  all: "No hay pacientes para mostrar.",
};

const OPERATIONAL_STATUSES_BY_FILTER: Record<
  Exclude<PatientsStatusFilter, "all">,
  PatientOperationalStatus[]
> = {
  active: ["active_treatment"],
  pending: ["ready_to_start", "preliminary"],
  preliminary: ["preliminary"],
  ready_to_start: ["ready_to_start"],
  finished: ["finished_treatment"],
};

function isLegacyPatientsStatusFilter(value: string): value is PatientsStatusFilterAlias {
  return value === "active_treatment" || value === "finished_treatment";
}

function normalizeStatusFilter(status?: string | string[]): PatientsStatusFilter {
  const value = Array.isArray(status) ? status[0] : status;

  if (value === "all") {
    return "all";
  }

  if (value === "active" || value === "active_treatment") {
    return "active";
  }

  if (
    value === "pending"
    || value === "preliminary"
    || value === "ready_to_start"
  ) {
    return value;
  }

  if (value === "finished" || value === "finished_treatment") {
    return "finished";
  }

  if (value && isLegacyPatientsStatusFilter(value)) {
    return value === "active_treatment" ? "active" : "finished";
  }

  return "active";
}

function matchesStatusFilter(
  operationalStatus: PatientOperationalStatus,
  filter: PatientsStatusFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  return OPERATIONAL_STATUSES_BY_FILTER[filter].includes(operationalStatus);
}

export default async function AdminPatientsPage({
  searchParams,
}: AdminPatientsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeStatusFilter(resolvedSearchParams?.status);
  const patients = await loadPatientsListWithOperationalSignals();
  const filteredPatients = patients.filter((patient) =>
    matchesStatusFilter(patient.operationalStatus, activeFilter),
  );

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pacientes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Listado operativo priorizado por estado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            href="/admin/requests/new"
          >
            Nueva solicitud de atención
          </Link>
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            href="/admin/patients/new"
          >
            Nuevo paciente
          </Link>
        </div>
      </div>

      <PatientsFiltersPanel
        activeFilter={activeFilter}
        buildHref={buildPatientsStatusHref}
        filters={STATUS_FILTERS}
      />

      <section className="mx-auto mt-4 w-full max-w-4xl space-y-2.5">
        {filteredPatients.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            {EMPTY_STATE_BY_FILTER[activeFilter]}
          </p>
        ) : (
          filteredPatients.map((patient) => {
            const treatmentBadge = getTreatmentBadgePresentation(
              patient.operationalStatus,
            );
            const mapsHref = buildGoogleMapsSearchHref(patient.address);
            const addressLabel = formatAddressDisplay(patient.address);
            const actions = getPatientListActions({
              patientId: patient.id,
              operationalStatus: patient.operationalStatus,
              hasAcceptedPendingTreatment: patient.operationalSignals.hasAcceptedPendingTreatment,
            });
            const primaryAction = actions.find((action) => action.kind === "primary");
            const secondaryActions = actions.filter((action) => action.kind === "secondary");

            return (
              <article
                key={patient.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="grid gap-3">
                  <header className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900">
                        <Link
                          className="hover:underline"
                          href={`/admin/patients/${patient.id}`}
                        >
                          {patient.fullName}
                        </Link>
                      </h3>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
                    >
                      {treatmentBadge.label}
                    </span>
                  </header>

                  <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600">
                    <span>DNI: {formatDniDisplay(patient.dni)}</span>
                    <span>Tel: {formatPhoneDisplay(patient.phone)}</span>
                    <span>Dirección: {addressLabel}</span>
                  </p>

                  <div className="min-h-5">
                    {patient.operationalSignals.hasInReviewRequest
                      || patient.operationalSignals.hasAcceptedPendingTreatment ? (
                        <div className="flex flex-wrap gap-1.5">
                          {patient.operationalSignals.hasInReviewRequest ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              Solicitud en evaluación
                            </span>
                          ) : null}
                          {patient.operationalSignals.hasAcceptedPendingTreatment ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              Aceptada, sin iniciar
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                  </div>

                  <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {primaryAction ? (
                        <Link
                          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                          href={primaryAction.href}
                        >
                          {primaryAction.label}
                        </Link>
                      ) : null}

                      {secondaryActions.map((action) => (
                        <Link
                          key={action.href}
                          className="inline-flex items-center justify-center text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                          href={action.href}
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                      <PhoneContactActions
                        phone={patient.phone}
                        mainContactPhone={patient.mainContact?.phone}
                        entity="patient"
                        showMissingChannelsMessage={false}
                      />

                      {mapsHref ? (
                        <a
                          aria-label="Abrir en Maps"
                          className="inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                          href={mapsHref}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <svg
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                            <circle cx="12" cy="10" fill="currentColor" r="2.2" />
                          </svg>
                          Mapa
                        </a>
                      ) : null}
                    </div>
                  </footer>
                </div>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}
