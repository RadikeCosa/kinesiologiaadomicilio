import type { Metadata } from "next";
import Link from "next/link";

import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";
import {
  loadActiveTreatmentEncountersCount,
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
  const activeEpisode = patient?.activeEpisode ?? null;
  const hasActiveTreatment = Boolean(activeEpisode);
  const hasClosedEpisodes = treatmentEpisodeHistory.length > 0;
  const hasAnyEpisode = hasActiveTreatment || hasClosedEpisodes;
  const canStartTreatmentFromCurrentContext = treatmentServiceRequestContext.state === "valid" && Boolean(treatmentServiceRequestContext.serviceRequestId);
  const clinicalContext = activeEpisode ? await loadEpisodeClinicalContextReadModel(activeEpisode) : null;
  const activeTreatmentEncountersCount = activeEpisode
    ? await loadActiveTreatmentEncountersCount(patient.id, activeEpisode.id)
    : 0;
  const latestClosedEpisode = !hasActiveTreatment
    ? treatmentEpisodeHistory.find((episode) => episode.id === patient?.latestEpisode?.id) ?? treatmentEpisodeHistory[0]
    : null;
  const hasValidAcceptedRequest = Boolean(treatmentServiceRequestContext.serviceRequest);

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
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${patient.id}`}
        >
          ← Volver al paciente
        </Link>
        <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Paciente</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{patient.fullName}</h1>
          <p className="mt-2 text-sm text-slate-600">
            DNI: {formatDniDisplay(patient.dni)}
            {patientAge !== null ? ` · Edad: ${patientAge} años` : ""}
          </p>
        </section>
      </div>
      {statusMessage ? <p className="mt-3 rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{statusMessage}</p> : null}
      <section className="mt-5 space-y-5">
        <section className={`rounded-xl border p-5 ${
          hasActiveTreatment
            ? "border-sky-200 bg-sky-50"
            : hasValidAcceptedRequest
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-slate-50"
        }`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl space-y-2">
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                hasActiveTreatment ? "text-sky-800" : hasValidAcceptedRequest ? "text-emerald-900" : "text-slate-600"
              }`}>Tratamiento</p>
              <h2 className={`text-2xl font-semibold ${
                hasActiveTreatment ? "text-sky-950" : hasValidAcceptedRequest ? "text-emerald-950" : "text-slate-900"
              }`}>
                {hasActiveTreatment ? "En curso" : hasValidAcceptedRequest ? "Listo para iniciar" : "Sin tratamiento activo"}
              </h2>
              <p className="text-sm text-slate-600">{PATIENT_SURFACE_COPY.treatmentDefinition}</p>
              {hasActiveTreatment ? (
                <>
                  <p className="text-sm text-sky-950">
                    Completá el contexto clínico acá y registrá cada visita desde Gestión clínica.
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-sky-900">
                    <span>Inicio: {formatDateDisplay(activeEpisode.startDate)}</span>
                    <span>Estado: ciclo en curso</span>
                    <span>
                      {activeTreatmentEncountersCount} {activeTreatmentEncountersCount === 1 ? "sesión registrada" : "sesiones registradas"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className={`text-sm ${hasValidAcceptedRequest ? "text-emerald-900" : "text-slate-700"}`}>
                    Para registrar visitas primero necesitás iniciar un tratamiento desde una solicitud de atención aceptada.
                  </p>
                  {hasValidAcceptedRequest ? (
                    <p className="text-sm text-emerald-900">
                      Ya hay una solicitud aceptada disponible para iniciar el tratamiento.
                    </p>
                  ) : null}
                  {!hasValidAcceptedRequest && latestClosedEpisode ? (
                    <p className="text-sm text-slate-700">
                      Último tratamiento finalizado: {latestClosedEpisode.endDate ? formatDateDisplay(latestClosedEpisode.endDate) : "Sin fecha registrada"}.
                    </p>
                  ) : null}
                </>
              )}
            </div>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getTreatmentBadgePresentation(patient.operationalStatus)?.className}`}>
              {getTreatmentBadgePresentation(patient.operationalStatus)?.label}
            </span>
          </div>
        </section>

        {treatmentServiceRequestContext.serviceRequest ? (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">Solicitud aceptada disponible</p>
            <div className="mt-2 space-y-1 text-sm text-emerald-900">
              <p>Fecha: {formatDateDisplay(treatmentServiceRequestContext.serviceRequest.requestedAt)}</p>
              <p>Motivo: {treatmentServiceRequestContext.serviceRequest.reasonText}</p>
              {treatmentServiceRequestContext.serviceRequest.reportedDiagnosisText ? (
                <p>Diagnóstico informado: {treatmentServiceRequestContext.serviceRequest.reportedDiagnosisText}</p>
              ) : null}
              {treatmentServiceRequestContext.serviceRequest.requesterDisplay ? (
                <p>Solicitante: {treatmentServiceRequestContext.serviceRequest.requesterDisplay}</p>
              ) : null}
            </div>
          </section>
        ) : treatmentServiceRequestContext.state === "already_used" ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {treatmentServiceRequestContext.message}
          </p>
        ) : resolvedSearchParams?.serviceRequestId ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            No se pudo usar la solicitud indicada para iniciar tratamiento. Si iniciás el tratamiento desde este formulario, no quedará vinculado a esa solicitud.
          </p>
        ) : null}

        {!hasActiveTreatment && canStartTreatmentFromCurrentContext ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <StartEpisodeOfCareForm patient={patient} serviceRequestId={treatmentServiceRequestContext.serviceRequestId} />
          </section>
        ) : null}

        {activeEpisode ? (
          <TreatmentClinicalContextForm patientId={patient.id} episodeOfCareId={activeEpisode.id} initialData={clinicalContext} />
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Atajos útiles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {hasActiveTreatment ? (
              <Link
                className="inline-flex items-center justify-center rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                href={`/admin/patients/${patient.id}/encounters`}
              >
                Ir a gestión clínica
              </Link>
            ) : null}
            <Link
              className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              href={`/admin/patients/${patient.id}/administrative`}
            >
              Ver gestión administrativa
            </Link>
            {!hasActiveTreatment ? (
              <Link
                className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                href={`/admin/patients/${patient.id}/administrative#service-requests`}
              >
                Ver solicitudes
              </Link>
            ) : null}
          </div>

          {hasActiveTreatment ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold text-slate-900">Cerrar tratamiento</h2>
              <p className="mt-1 text-sm text-slate-600">Acción de cierre formal del ciclo. Usala cuando el tratamiento ya terminó.</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-slate-800">Abrir formulario de cierre</summary>
                <div className="mt-3">
                  <FinishEpisodeOfCareForm patient={patient} />
                </div>
              </details>
            </div>
          ) : null}
        </section>

        {!hasActiveTreatment && latestClosedEpisode ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Último tratamiento finalizado</p>
            <div className="mt-2 max-w-2xl space-y-1 text-sm text-slate-700">
              <p>Inicio: {formatDateDisplay(latestClosedEpisode.startDate)}</p>
              <p>Cierre: {latestClosedEpisode.endDate ? formatDateDisplay(latestClosedEpisode.endDate) : "Sin fecha registrada"}</p>
              <p>Motivo: {latestClosedEpisode.closureReason ? EPISODE_OF_CARE_CLOSURE_REASON_LABELS[latestClosedEpisode.closureReason as keyof typeof EPISODE_OF_CARE_CLOSURE_REASON_LABELS] ?? latestClosedEpisode.closureReason : "Sin dato"}</p>
            </div>
            <Link className="mt-3 inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href={`/admin/patients/${patient.id}/administrative#service-requests`}>
              Gestión administrativa para nuevo ciclo
            </Link>
          </section>
        ) : null}
      </section>

      <section className="mt-5 grid gap-4">
        {hasAnyEpisode && treatmentEpisodeHistory.length > 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Historial de ciclos cerrados</h2>
            <p className="mt-1 text-sm text-slate-600">Bloque secundario de antecedentes. No reemplaza el estado actual del tratamiento.</p>
            <ul className="mt-3 space-y-2">
            {treatmentEpisodeHistory.map((episode) => (
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700" key={episode.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">Ciclo finalizado</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDateDisplay(episode.startDate)} → {episode.endDate ? formatDateDisplay(episode.endDate) : "Sin fecha registrada"}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">Finalizado</span>
                </div>
                <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold uppercase tracking-wide text-slate-500">Motivo</dt>
                    <dd className="mt-0.5">{formatClosureReasonDisplay(episode.closureReason)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-wide text-slate-500">Solicitud</dt>
                    <dd className="mt-0.5">{episode.serviceRequestId || "Sin solicitud vinculada"}</dd>
                  </div>
                  <div className="sm:col-span-3">
                    <dt className="font-semibold uppercase tracking-wide text-slate-500">Detalle</dt>
                    <dd className="mt-0.5">{episode.closureDetail || "Sin detalle adicional"}</dd>
                  </div>
                </dl>
              </li>
            ))}
            </ul>
          </section>
        ) : null}
      </section>
    </section>
  );
}
