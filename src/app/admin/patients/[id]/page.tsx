import type { Metadata } from "next";
import Link from "next/link";

import { MapsLinkAction } from "@/app/admin/patients/components/MapsLinkAction";
import { PhoneContactBlock } from "@/app/admin/patients/components/PhoneContactBlock";
import { loadPatientDetail, loadPatientHubServiceRequestContext } from "@/app/admin/patients/[id]/data";
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
import { PATIENT_SURFACE_COPY } from "@/app/admin/patients/[id]/patient-surface-copy";

import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import { EPISODE_OF_CARE_CLOSURE_REASON_LABELS } from "@/domain/episode-of-care/episode-of-care.types";

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



function getNextStepSuggestion(input: {
  hasActiveEpisode: boolean;
  latestEpisodeFinished: boolean;
  serviceRequestContext: Awaited<ReturnType<typeof loadPatientHubServiceRequestContext>> | null;
}) {
  if (input.hasActiveEpisode) {
    return "Registrá visitas desde Gestión Clínica.";
  }

  if (input.serviceRequestContext?.pendingAcceptedServiceRequestId) {
    return "Iniciá el tratamiento desde la solicitud aceptada.";
  }

  if (input.serviceRequestContext?.hasInReview) {
    return "Continuá la resolución administrativa de la solicitud.";
  }

  if (!input.serviceRequestContext?.hasServiceRequests) {
    return "Registrá la primera solicitud de atención.";
  }

  if (input.latestEpisodeFinished) {
    return "Si requiere un nuevo ciclo, registrá una nueva solicitud de atención.";
  }

  return "Registrá la primera solicitud de atención.";
}

function getLatestServiceRequestSummary(serviceRequestContext: Awaited<ReturnType<typeof loadPatientHubServiceRequestContext>> | null): string | null {
  if (!serviceRequestContext?.latestClosedRequestStatus || !serviceRequestContext.latestClosedRequestReason) {
    return null;
  }

  const statusLabel = serviceRequestContext.latestClosedRequestStatus === "closed_without_treatment"
    ? "No inició"
    : "Cancelada";

  return `Última solicitud: ${statusLabel} — Motivo: ${serviceRequestContext.latestClosedRequestReason}`;
}

function getLatestEpisodeSummary(patient: NonNullable<Awaited<ReturnType<typeof loadPatientDetail>>>): string | null {
  if (patient.latestEpisode?.status !== "finished" || !patient.latestEpisode.closureReason) {
    return null;
  }

  const reasonLabel = EPISODE_OF_CARE_CLOSURE_REASON_LABELS[patient.latestEpisode.closureReason];

  return `Último tratamiento: finalizado — Motivo: ${reasonLabel}`;
}
export default async function AdminPatientDetailPage({
  params,
}: AdminPatientDetailPageProps) {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  const treatmentSummary = patient ? getTreatmentSummary(patient) : null;
  const serviceRequestContext = patient
    ? await loadPatientHubServiceRequestContext(patient.id)
    : null;
  const primaryAction = patient ? getPrimaryPatientAction(patient) : null;
  const isClinicalPrimary = primaryAction === "clinical";
  const mapsHref = patient ? buildGoogleMapsSearchHref(patient.address) : null;
  const addressLabel = patient ? formatAddressDisplay(patient.address) : null;
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;
  const latestServiceRequestSummary = getLatestServiceRequestSummary(serviceRequestContext);
  const latestEpisodeSummary = patient ? getLatestEpisodeSummary(patient) : null;
  const nextStepSuggestion = patient
    ? getNextStepSuggestion({
        hasActiveEpisode: Boolean(patient.activeEpisode),
        latestEpisodeFinished: patient.latestEpisode?.status === "finished",
        serviceRequestContext,
      })
    : null;

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href="/admin/patients"
      >
        ← Volver a pacientes
      </Link>

      {patient ? (
        <div className="mt-3">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
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

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
                  <p className="font-medium">DNI: {formatDniDisplay(patient.dni)}</p>
                  {patientAge !== null ? (
                    <p className="text-slate-600">Edad: {patientAge} años</p>
                  ) : null}
                  {treatmentSummary?.detail ? (
                    <p className="text-slate-600">{treatmentSummary.detail}</p>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600">
                  Resumen general del estado y contacto del paciente.
                </p>

                {latestEpisodeSummary ? (
                  <p className="text-xs text-slate-500">{latestEpisodeSummary}</p>
                ) : null}

                {latestServiceRequestSummary ? (
                  <p className="text-xs text-slate-500">{latestServiceRequestSummary}</p>
                ) : null}

                {nextStepSuggestion ? (
                  <p className="mt-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-900">
                    Siguiente paso sugerido: {nextStepSuggestion}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">
                  {PATIENT_SURFACE_COPY.flowDefinition}
                </p>
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${
                      isClinicalPrimary
                        ? "bg-slate-900 text-white hover:bg-slate-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                    href={`/admin/patients/${patient.id}/encounters`}
                  >
                    Gestión clínica
                  </Link>
                  <Link
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${
                      !isClinicalPrimary
                        ? "bg-slate-900 text-white hover:bg-slate-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                    href={`/admin/patients/${patient.id}/administrative`}
                  >
                    Gestión administrativa
                  </Link>
                </div>
                <p className="text-xs text-slate-500">
                  Gestión clínica: visitas y seguimiento operativo del tratamiento.
                </p>
                <p className="text-xs text-slate-500">
                  Gestión administrativa: datos del paciente y solicitudes de atención.
                </p>

                {!patient.activeEpisode ? (
                  <Link
                    className="inline-flex items-center justify-center self-start whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    href={`/admin/patients/${patient.id}/administrative?newServiceRequest=1#service-requests`}
                  >
                    Crear solicitud de atención
                  </Link>
                ) : null}

                {patient.activeEpisode ? (
                  <Link
                    className="inline-flex items-center justify-center self-start whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    href={`/admin/patients/${patient.id}/encounters/new`}
                  >
                    Registrar visita
                  </Link>
                ) : null}
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
                    <MapsLinkAction
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
                      href={mapsHref}
                    />
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
