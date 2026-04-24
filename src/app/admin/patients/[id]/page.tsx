import type { Metadata } from "next";
import Link from "next/link";

import { PhoneContactBlock } from "@/app/admin/patients/components/PhoneContactBlock";
import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import {
  buildGoogleMapsSearchHref,
  formatAddressDisplay,
} from "@/lib/patient-contact-links";
import {
  calculateAgeFromBirthDate,
  formatContactRelationshipLabel,
  formatDateDisplay,
  formatDniDisplay,
} from "@/lib/patient-admin-display";

import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";

interface AdminPatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return {
    title: patient?.fullName ?? "Detalle de paciente",
  };
}

function getTreatmentSummary(
  patient: NonNullable<Awaited<ReturnType<typeof loadPatientDetail>>>,
) {
  const treatmentBadge = getTreatmentBadgePresentation(
    patient.operationalStatus,
  );

  if (patient.activeEpisode) {
    return {
      badgeLabel: treatmentBadge.label,
      badgeClassName: treatmentBadge.className,
      detail: `Inicio: ${formatDateDisplay(patient.activeEpisode.startDate)}`,
    };
  }

  if (patient.latestEpisode?.status === "finished") {
    return {
      badgeLabel: treatmentBadge.label,
      badgeClassName: treatmentBadge.className,
      detail: `Fin: ${formatDateDisplay(patient.latestEpisode.endDate)}`,
    };
  }

  return {
    badgeLabel: treatmentBadge.label,
    badgeClassName: treatmentBadge.className,
    detail: null,
  };
}

function getPrimaryPatientAction(
  patient: NonNullable<Awaited<ReturnType<typeof loadPatientDetail>>>,
): "clinical" | "administrative" {
  // Regla estable: tratamiento activo => priorizar operación clínica; caso contrario => priorizar administrativa.
  return patient.activeEpisode ? "clinical" : "administrative";
}

export default async function AdminPatientDetailPage({
  params,
}: AdminPatientDetailPageProps) {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  const treatmentSummary = patient ? getTreatmentSummary(patient) : null;
  const primaryAction = patient ? getPrimaryPatientAction(patient) : null;
  const isClinicalPrimary = primaryAction === "clinical";
  const mapsHref = patient ? buildGoogleMapsSearchHref(patient.address) : null;
  const addressLabel = patient ? formatAddressDisplay(patient.address) : null;
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href="/admin/patients"
      >
        ← Volver a pacientes
      </Link>

      {patient ? (
        <div className="mt-3">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {patient.fullName}
                  </h1>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentSummary?.badgeClassName}`}
                  >
                    {treatmentSummary?.badgeLabel}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-700">
                  DNI: {formatDniDisplay(patient.dni)}
                </p>
                <p className="text-sm text-slate-600">
                  Resumen general del estado y contacto del paciente.
                </p>
                {patientAge !== null ? (
                  <p className="text-xs text-slate-500">Edad: {patientAge} años</p>
                ) : null}

                {treatmentSummary?.detail ? (
                  <p className="text-xs text-slate-500">
                    {treatmentSummary.detail}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
                <Link
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${
                    isClinicalPrimary
                      ? "bg-slate-900 text-white hover:bg-slate-700"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                  href={`/admin/patients/${patient.id}/encounters`}
                >
                  Gestión Clínica
                </Link>
                <Link
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${
                    !isClinicalPrimary
                      ? "bg-slate-900 text-white hover:bg-slate-700"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                  href={`/admin/patients/${patient.id}/administrative`}
                >
                  Gestión Administrativa
                </Link>
              </div>
            </header>

            <section className="mt-4 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800">
              <h2 className="text-sm font-semibold text-slate-900">Contacto</h2>

              <div className="mt-3 grid gap-3">
                <section className="rounded-md border border-slate-300 bg-white p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                    Contacto del paciente
                  </h3>
                  <div className="mt-2">
                    <PhoneContactBlock
                      phone={patient.phone}
                      phoneLabel="Teléfono"
                    />
                  </div>
                </section>

                <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Dirección
                  </h3>
                  <p className="mt-2 text-sm text-slate-700">{addressLabel}</p>
                  {mapsHref ? (
                    <a
                      aria-label="Abrir en Maps"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
                      href={mapsHref}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Abrir en Maps
                    </a>
                  ) : null}
                </section>

                {patient.mainContact ? (
                  <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                      Contacto principal
                    </h3>
                    <dl className="mt-2 space-y-1.5">
                      <div>
                        <dt className="font-medium">Nombre</dt>
                        <dd>{patient.mainContact.name ?? "No informado"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Vínculo</dt>
                        <dd>
                          {formatContactRelationshipLabel(
                            patient.mainContact.relationship,
                          )}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-2">
                      <PhoneContactBlock
                        phone={patient.mainContact.phone}
                        phoneLabel="Teléfono"
                      />
                    </div>
                  </section>
                ) : null}
              </div>
            </section>
          </section>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <h1 className="text-xl font-semibold text-slate-900">
            Paciente no encontrado
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            No se encontró el paciente solicitado.
          </p>
        </div>
      )}
    </section>
  );
}
