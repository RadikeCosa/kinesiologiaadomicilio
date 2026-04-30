import type { Metadata } from "next";
import Link from "next/link";

import { FinishEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm";
import { StartEpisodeOfCareForm } from "@/app/admin/patients/[id]/components/StartEpisodeOfCareForm";
import {
  loadPatientDetail,
  loadTreatmentServiceRequestContext,
} from "@/app/admin/patients/[id]/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
  formatDateDisplay,
  formatDniDisplay,
} from "@/lib/patient-admin-display";

interface AdminPatientTreatmentPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ serviceRequestId?: string }>;
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

export default async function AdminPatientTreatmentPage({
  params,
  searchParams,
}: AdminPatientTreatmentPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const patient = await loadPatientDetail(id);
  const treatmentServiceRequestContext = patient
    ? await loadTreatmentServiceRequestContext({
        patientId: patient.id,
        serviceRequestId: resolvedSearchParams?.serviceRequestId,
      })
    : { serviceRequestId: undefined, isValid: false, serviceRequest: undefined, state: "none", message: undefined };
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;
  const treatmentBadge = patient
    ? getTreatmentBadgePresentation(patient.operationalStatus)
    : null;
  const activeEpisode = patient?.activeEpisode ?? null;
  const hasActiveTreatment = Boolean(activeEpisode);
  const hasFinishedTreatment = !hasActiveTreatment && patient?.latestEpisode?.status === "finished";
  const canStartTreatmentFromCurrentContext = treatmentServiceRequestContext.state === "valid" && Boolean(treatmentServiceRequestContext.serviceRequestId);

  if (!patient) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver a pacientes
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Gestión de tratamiento</h2>

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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{patient.fullName}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge?.className}`}
            >
              {treatmentBadge?.label}
            </span>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            href={`/admin/patients/${patient.id}/encounters`}
          >
            Ver visitas
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-600">Inicio y cierre del tratamiento del paciente.</p>
        <p className="mt-1 text-xs text-slate-500">
          DNI: {formatDniDisplay(patient.dni)}
          {patientAge !== null ? ` · Edad: ${patientAge} años` : ""}
        </p>
      </div>

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
          <p className="mt-3 text-sm text-emerald-800">
            El tratamiento se iniciará desde esta solicitud. La visita se habilitará recién cuando exista un
            tratamiento activo.
          </p>
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Tratamiento activo
            </h2>
            <p className="mt-3 text-sm text-slate-700">Inicio: {formatDateDisplay(activeEpisode.startDate)}</p>
            <div className="mt-4">
              <FinishEpisodeOfCareForm patient={patient} />
            </div>
          </>
        ) : hasFinishedTreatment ? (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Tratamiento finalizado
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Finalización: {formatDateDisplay(patient.latestEpisode?.endDate)}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Este tratamiento ya está cerrado. Si hace falta continuar, podés iniciar un nuevo tratamiento.
            </p>
            {canStartTreatmentFromCurrentContext ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <StartEpisodeOfCareForm
                  patient={patient}
                  serviceRequestId={treatmentServiceRequestContext.serviceRequestId}
                />
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Para iniciar un tratamiento, primero aceptá una solicitud de atención desde Administración.
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Sin tratamiento activo
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Iniciá un tratamiento para habilitar el registro de visitas.
            </p>
            {canStartTreatmentFromCurrentContext ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <StartEpisodeOfCareForm
                  patient={patient}
                  serviceRequestId={treatmentServiceRequestContext.serviceRequestId}
                />
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Para iniciar un tratamiento, primero aceptá una solicitud de atención desde Administración.
              </p>
            )}
          </>
        )}
      </section>
    </section>
  );
}
