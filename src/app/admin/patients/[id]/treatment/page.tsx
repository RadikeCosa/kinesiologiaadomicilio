import type { Metadata } from "next";
import Link from "next/link";

import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";
import {
  loadPatientDetail,
  loadTreatmentEpisodeHistoryContext,
  loadTreatmentServiceRequestContext,
} from "@/app/admin/patients/[id]/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
  formatDateDisplay,
  formatDniDisplay,
} from "@/lib/patient-admin-display";
import { EPISODE_OF_CARE_CLOSURE_REASON_LABELS } from "@/domain/episode-of-care/episode-of-care.types";
import { PATIENT_SURFACE_COPY } from "@/app/admin/patients/[id]/patient-surface-copy";
import { loadEpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";
import { TreatmentClinicalContextForm } from "@/app/admin/patients/[id]/components/TreatmentClinicalContextForm";

interface AdminPatientTreatmentPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ serviceRequestId?: string; status?: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientTreatmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  return {
    title: patient ? `Tratamiento — ${patient.fullName}` : "Tratamiento",
  };
}

function formatClosureReasonDisplay(reason?: string): string {
  if (!reason) {
    return "Sin motivo registrado";
  }

  return EPISODE_OF_CARE_CLOSURE_REASON_LABELS[reason as keyof typeof EPISODE_OF_CARE_CLOSURE_REASON_LABELS] ?? reason;
}

export default async function AdminPatientTreatmentPage({
  params,
  searchParams,
}: AdminPatientTreatmentPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const statusMessage = resolvedSearchParams?.status === "treatment-started"
    ? "Tratamiento iniciado. Revisá o completá el contexto general del tratamiento."
    : undefined;
  const patient = await loadPatientDetail(id);
  const treatmentServiceRequestContext = patient
    ? await loadTreatmentServiceRequestContext({
        patientId: patient.id,
        serviceRequestId: resolvedSearchParams?.serviceRequestId,
      })
    : { serviceRequestId: undefined, isValid: false, serviceRequest: undefined, state: "none", message: undefined };
  const treatmentEpisodeHistory = patient ? await loadTreatmentEpisodeHistoryContext(patient.id) : [];
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;
  const treatmentBadge = patient
    ? getTreatmentBadgePresentation(patient.operationalStatus)
    : null;
  const activeEpisode = patient?.activeEpisode ?? null;
  const hasActiveTreatment = Boolean(activeEpisode);
  const hasClosedEpisodes = treatmentEpisodeHistory.length > 0;
  const hasAnyEpisode = hasActiveTreatment || hasClosedEpisodes;
  const canStartTreatmentFromCurrentContext = treatmentServiceRequestContext.state === "valid" && Boolean(treatmentServiceRequestContext.serviceRequestId);
  const clinicalContext = activeEpisode ? await loadEpisodeClinicalContextReadModel(activeEpisode) : null;
  const latestClosedEpisode = !hasActiveTreatment
    ? treatmentEpisodeHistory.find((episode) => episode.id === patient?.latestEpisode?.id) ?? treatmentEpisodeHistory[0]
    : null;

  if (!patient) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver a pacientes
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Tratamiento</h2>

        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${patient.id}`}
        >
          ← Volver al paciente
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">Tratamiento · Contexto general del tratamiento</h1>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge?.className}`}
              >
                {treatmentBadge?.label}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Organizá acá el contexto general del tratamiento. Las visitas se registran y se revisan desde Gestión clínica.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className={`inline-flex items-center justify-center rounded px-3 py-2 text-sm font-medium ${
                activeEpisode
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              href={`/admin/patients/${patient.id}/encounters`}
            >
              Ir a gestión clínica
            </Link>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">{PATIENT_SURFACE_COPY.treatmentDefinition}</p>
        <p className="mt-1 text-xs text-slate-500">
          DNI: {formatDniDisplay(patient.dni)}
          {patientAge !== null ? ` · Edad: ${patientAge} años` : ""}
        </p>
      </div>
      {statusMessage ? <p className="mt-3 rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{statusMessage}</p> : null}

      {activeEpisode ? (<TreatmentClinicalContextForm patientId={patient.id} episodeOfCareId={activeEpisode.id} initialData={clinicalContext} />) : null}

      {treatmentServiceRequestContext.serviceRequest ? (
        <section className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
            Inicio de tratamiento desde solicitud aceptada
          </h2>
          <p className="mt-3 text-sm text-emerald-900">
            Fecha de solicitud: {formatDateDisplay(treatmentServiceRequestContext.serviceRequest.requestedAt)}
          </p>
          <p className="mt-2 text-sm text-emerald-900">
            Motivo: {treatmentServiceRequestContext.serviceRequest.reasonText}
          </p>
          {treatmentServiceRequestContext.serviceRequest.reportedDiagnosisText ? (
            <p className="mt-2 text-sm text-emerald-900">
              Diagnóstico informado: {treatmentServiceRequestContext.serviceRequest.reportedDiagnosisText}
            </p>
          ) : null}
          {treatmentServiceRequestContext.serviceRequest.requesterDisplay ? (
            <p className="mt-2 text-sm text-emerald-900">
              Solicitante: {treatmentServiceRequestContext.serviceRequest.requesterDisplay}
            </p>
          ) : null}
        </section>
      ) : treatmentServiceRequestContext.state === "already_used" ? (
        <p className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {treatmentServiceRequestContext.message}
        </p>
      ) : resolvedSearchParams?.serviceRequestId ? (
        <p className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          No se pudo usar la solicitud indicada para iniciar tratamiento. Si iniciás el tratamiento desde este
          formulario, no quedará vinculado a esa solicitud.
        </p>
      ) : null}

      <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {activeEpisode ? (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Tratamiento activo</h2>
            <p className="mt-3 text-sm text-slate-700">Inicio: {formatDateDisplay(activeEpisode.startDate)}</p>
            <p className="mt-2 text-sm text-slate-700">Ya podés registrar visitas desde Gestión clínica. Mantené acá el contexto general que organiza el tratamiento.</p>
          </>
        ) : hasClosedEpisodes ? (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">No hay tratamiento activo</h2>
            <p className="mt-3 text-sm text-slate-700">No se pueden registrar visitas hasta iniciar un tratamiento activo.</p>
            <p className="mt-2 text-sm text-slate-700">Si corresponde continuar la atención, primero registrá una nueva solicitud de atención y luego iniciá el tratamiento desde una solicitud aceptada.</p>
            <Link className="mt-3 inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href={`/admin/patients/${patient.id}/administrative#service-requests`}>
              Ver historial de solicitudes
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">No hay tratamientos registrados</h2>
            <p className="mt-3 text-sm text-slate-700">No se pueden registrar visitas hasta iniciar un tratamiento activo.</p>
            <p className="mt-2 text-sm text-slate-700">El inicio debe hacerse desde una solicitud de atención aceptada.</p>
            <Link className="mt-3 inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href={`/admin/patients/${patient.id}/administrative#service-requests`}>
              Ir a solicitudes
            </Link>
          </>
        )}

        {!hasActiveTreatment && canStartTreatmentFromCurrentContext ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4"><StartEpisodeOfCareForm patient={patient} serviceRequestId={treatmentServiceRequestContext.serviceRequestId} /></div>
        ) : null}
      </section>

      {latestClosedEpisode ? (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Resumen del tratamiento finalizado</h2>
          <p className="mt-3 text-sm text-slate-700">Inicio: {formatDateDisplay(latestClosedEpisode.startDate)}</p>
          <p className="mt-2 text-sm text-slate-700">Cierre: {latestClosedEpisode.endDate ? formatDateDisplay(latestClosedEpisode.endDate) : "Sin fecha registrada"}</p>
          <p className="mt-2 text-sm text-slate-700">Motivo: {latestClosedEpisode.closureReason ? EPISODE_OF_CARE_CLOSURE_REASON_LABELS[latestClosedEpisode.closureReason as keyof typeof EPISODE_OF_CARE_CLOSURE_REASON_LABELS] ?? latestClosedEpisode.closureReason : "Sin dato"}</p>
          <p className="mt-2 text-sm text-slate-700">Detalle: {latestClosedEpisode.closureDetail || "Sin detalle"}</p>
          <p className="mt-2 text-sm text-slate-700">Solicitud de origen: {latestClosedEpisode.serviceRequestId || "Sin solicitud vinculada"}</p>
          <p className="mt-2 text-sm text-slate-700">Diagnóstico: {latestClosedEpisode.medicalReferenceDiagnosisText || "Sin dato"}</p>
          <p className="mt-2 text-sm text-slate-700">Diagnóstico kinésico: {latestClosedEpisode.kinesiologicDiagnosisText || "Sin dato"}</p>
          <p className="mt-2 text-sm text-slate-700">Objetivos: {latestClosedEpisode.therapeuticGoals || "Sin dato"}</p>
          <p className="mt-2 text-sm text-slate-700">Plan: {latestClosedEpisode.frameworkPlan || "Sin dato"}</p>
          <Link className="mt-3 inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href={`/admin/patients/${patient.id}/administrative#service-requests`}>Gestión administrativa para nuevo ciclo</Link>
        </section>
      ) : null}

      {activeEpisode ? <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4"><details><summary className="cursor-pointer text-sm font-semibold text-slate-800">Cerrar ciclo de tratamiento (acción final)</summary><div className="mt-3"><FinishEpisodeOfCareForm patient={patient} /></div></details></section> : null}

      {hasAnyEpisode && treatmentEpisodeHistory.length > 0 ? (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Historial de ciclos cerrados</h2>
          <p className="mt-2 text-sm text-slate-600">Ciclos anteriores del paciente. No reemplazan el tratamiento activo actual.</p>
          <ul className="mt-3 space-y-2.5">
            {treatmentEpisodeHistory.map((episode) => (
              <li className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" key={episode.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">Ciclo finalizado</p>
                  <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">Finalizado</span>
                </div>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inicio</dt>
                    <dd className="mt-0.5">{formatDateDisplay(episode.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cierre</dt>
                    <dd className="mt-0.5">{episode.endDate ? formatDateDisplay(episode.endDate) : "Sin fecha registrada"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Motivo</dt>
                    <dd className="mt-0.5">{formatClosureReasonDisplay(episode.closureReason)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Solicitud de origen</dt>
                    <dd className="mt-0.5">{episode.serviceRequestId || "Sin solicitud vinculada"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detalle</dt>
                    <dd className="mt-0.5">{episode.closureDetail || "Sin detalle adicional"}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
