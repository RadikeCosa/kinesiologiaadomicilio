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
  | "active_treatment"
  | "pending"
  | "preliminary"
  | "ready_to_start"
  | "finished"
  | "finished_treatment"
  | "all";

interface AdminPatientsPageProps {
  searchParams?: Promise<{ status?: string | string[] }>;
}

function buildPatientsStatusHref(
  status?: Exclude<PatientsStatusFilter, "all">,
): string {
  const searchParams = new URLSearchParams();

  if (status) {
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
    value: "pending",
    label: "Sin tratamiento activo",
  },
  {
    value: "preliminary",
    label: "Faltan datos",
  },
  {
    value: "ready_to_start",
    label: "Listos para iniciar",
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
  ready_to_start: "No hay pacientes listos para iniciar tratamiento.",
  finished: "No hay pacientes con tratamiento finalizado.",
  all: "No hay pacientes para mostrar.",
};

const OPERATIONAL_STATUSES_BY_FILTER: Record<
  Exclude<PatientsStatusFilter, "all">,
  PatientOperationalStatus[]
> = {
  active: ["active_treatment"],
  active_treatment: ["active_treatment"],
  pending: ["ready_to_start", "preliminary"],
  preliminary: ["preliminary"],
  ready_to_start: ["ready_to_start"],
  finished: ["finished_treatment"],
  finished_treatment: ["finished_treatment"],
};

function normalizeStatusFilter(status?: string | string[]): PatientsStatusFilter {
  const value = Array.isArray(status) ? status[0] : status;

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
          Estado operativo
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Filtro principal del listado según situación actual del paciente.
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
                href={buildPatientsStatusHref(
                  filter.value === "all" ? undefined : filter.value,
                )}
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
            {EMPTY_STATE_BY_FILTER[activeFilter]}
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
                            Solicitud aceptada sin iniciar
                          </span>
                        ) : null}
                      </div>
                    ) : null}

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
