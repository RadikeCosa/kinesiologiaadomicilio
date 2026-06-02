import type { Metadata } from "next";
import Link from "next/link";

import { MapsLinkAction } from "@/app/admin/patients/components/MapsLinkAction";
import { PhoneContactActions } from "@/app/admin/patients/components/PhoneContactActions";
import { loadPatientsListWithOperationalSignals } from "@/app/admin/patients/data";
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

interface AdminPatientsPageProps {
  searchParams?: Promise<{ status?: string | string[]; signal?: string | string[] }>;
}

type PatientsSignalFilter = "in_review_requests" | "accepted_pending_treatment" | "all";

const STATUS_FILTERS: Array<{
  value: PatientsStatusFilter;
  label: string;
  href: string;
}> = [
  { value: "all", label: "Todos", href: "/admin/patients" },
  {
    value: "active",
    label: "En tratamiento",
    href: "/admin/patients?status=active",
  },
  {
    value: "pending",
    label: "Sin tratamiento activo",
    href: "/admin/patients?status=pending",
  },
  {
    value: "preliminary",
    label: "Faltan datos",
    href: "/admin/patients?status=preliminary",
  },
  {
    value: "ready_to_start",
    label: "Listos para iniciar",
    href: "/admin/patients?status=ready_to_start",
  },
  {
    value: "finished",
    label: "Finalizados",
    href: "/admin/patients?status=finished",
  },
];

const EMPTY_STATE_BY_FILTER: Record<PatientsStatusFilter, string> = {
  active: "No hay pacientes en tratamiento.",
  pending: "No hay pacientes sin tratamiento activo.",
  preliminary: "No hay pacientes con datos pendientes para iniciar.",
  ready_to_start: "No hay pacientes listos para iniciar tratamiento.",
  finished: "No hay pacientes con tratamiento finalizado.",
  all: "No hay pacientes para mostrar.",
};

const SIGNAL_FILTERS: Array<{
  value: PatientsSignalFilter;
  label: string;
  href: string;
}> = [
  { value: "all", label: "Todas", href: "/admin/patients" },
  {
    value: "in_review_requests",
    label: "Solicitudes en evaluación",
    href: "/admin/patients?signal=in_review_requests",
  },
  {
    value: "accepted_pending_treatment",
    label: "Pendientes de iniciar",
    href: "/admin/patients?signal=accepted_pending_treatment",
  },
];

const EMPTY_STATE_BY_SIGNAL: Record<Exclude<PatientsSignalFilter, "all">, string> = {
  in_review_requests: "No hay pacientes con solicitudes en evaluación.",
  accepted_pending_treatment: "No hay pacientes con solicitudes aceptadas pendientes de iniciar.",
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

function normalizeStatusFilter(status?: string | string[]): PatientsStatusFilter {
  const value = Array.isArray(status) ? status[0] : status;

  if (
    value === "active"
    || value === "pending"
    || value === "preliminary"
    || value === "ready_to_start"
    || value === "finished"
  ) {
    return value;
  }

  return "all";
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

function normalizeSignalFilter(signal?: string | string[]): PatientsSignalFilter {
  const value = Array.isArray(signal) ? signal[0] : signal;

  if (value === "in_review_requests" || value === "accepted_pending_treatment") {
    return value;
  }

  return "all";
}

export default async function AdminPatientsPage({
  searchParams,
}: AdminPatientsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeStatusFilter(resolvedSearchParams?.status);
  const activeSignalFilter = normalizeSignalFilter(resolvedSearchParams?.signal);
  const patients = await loadPatientsListWithOperationalSignals();
  const filteredPatients = patients.filter((patient) => {
    if (activeSignalFilter === "in_review_requests") {
      return patient.operationalSignals.hasInReviewRequest;
    }

    if (activeSignalFilter === "accepted_pending_treatment") {
      return patient.operationalSignals.hasAcceptedPendingTreatment;
    }

    return matchesStatusFilter(patient.operationalStatus, activeFilter);
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pacientes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hacé clic en un paciente para ver más detalles o gestionar su
            información.
          </p>
        </div>

        <Link
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          href="/admin/patients/new"
        >
          Nuevo paciente
        </Link>
      </div>

      <nav aria-label="Filtrar pacientes por estado" className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Estado del paciente
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive = filter.value === activeFilter;

            return (
              <Link
                key={filter.value}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                href={filter.href}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Filtrar pacientes por señales operativas"
        className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Señales de solicitudes
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Vistas puntuales para revisar pedidos y comienzos pendientes.
        </p>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_FILTERS.map((filter) => {
            const isActive = filter.value === activeSignalFilter;

            return (
              <Link
                key={filter.value}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? "border-slate-700 bg-slate-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
                href={filter.href}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <section className="mt-4 space-y-2.5">
        {filteredPatients.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            {activeSignalFilter === "all"
              ? EMPTY_STATE_BY_FILTER[activeFilter]
              : EMPTY_STATE_BY_SIGNAL[activeSignalFilter]}
          </p>
        ) : (
          filteredPatients.map((patient) => {
            const treatmentBadge = getTreatmentBadgePresentation(
              patient.operationalStatus,
            );
            const mapsHref = buildGoogleMapsSearchHref(patient.address);
            const addressLabel = formatAddressDisplay(patient.address);

            return (
              <article
                key={patient.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      <Link
                        className="hover:underline"
                        href={`/admin/patients/${patient.id}`}
                      >
                        {patient.fullName}
                      </Link>
                    </h3>

                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
                    >
                      {treatmentBadge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <p className="text-xs text-slate-600">
                      DNI: {formatDniDisplay(patient.dni)} · Tel:{" "}
                      {formatPhoneDisplay(patient.phone)}
                    </p>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {patient.operationalStatus === "active_treatment" ? (
                        <Link
                          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          href={`/admin/patients/${patient.id}/encounters/new`}
                        >
                          Registrar visita
                        </Link>
                      ) : null}
                      <PhoneContactActions
                        phone={patient.phone}
                        mainContactPhone={patient.mainContact?.phone}
                        entity="patient"
                        showMissingChannelsMessage={false}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-700">
                      Dirección: {addressLabel}
                    </p>
                    {mapsHref ? (
                      <MapsLinkAction
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
                        href={mapsHref}
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}
