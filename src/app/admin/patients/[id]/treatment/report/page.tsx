import type { Metadata } from "next";
import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import { TreatmentReportEditor } from "@/app/admin/patients/[id]/treatment/report/components/TreatmentReportEditor";
import { composeTreatmentReport } from "@/features/treatment-report/treatment-report.composer";
import { loadTreatmentReportContext } from "@/features/treatment-report/treatment-report.read-model";
import type {
  TreatmentReportLoadFailureReason,
  TreatmentReportMode,
} from "@/features/treatment-report/treatment-report.types";
import { formatDateDisplay } from "@/lib/patient-admin-display";
import { formatFunctionalDelta, formatFunctionalValue } from "@/app/admin/patients/[id]/encounters/functional-trend";

interface AdminPatientTreatmentReportPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ mode?: string; episodeId?: string }>;
}

function parseReportMode(value: string | undefined): TreatmentReportMode | null {
  if (value === "progress" || value === "closure") {
    return value;
  }

  return null;
}

function getPageTitle(mode: TreatmentReportMode | null): string {
  if (mode === "closure") {
    return "Informe de cierre";
  }

  if (mode === "progress") {
    return "Informe de progreso";
  }

  return "Informe de tratamiento";
}

function getFailureMessage(reason: TreatmentReportLoadFailureReason | "missing_mode" | "missing_episode_id"): string {
  switch (reason) {
    case "missing_mode":
      return "No se indico el tipo de informe que queres preparar.";
    case "missing_episode_id":
      return "No se indico el episodio sobre el que queres preparar el informe.";
    case "missing_patient":
      return "No se encontro el paciente solicitado.";
    case "missing_episode":
      return "No se encontro el episodio solicitado.";
    case "episode_belongs_to_another_patient":
      return "El episodio indicado no pertenece a este paciente.";
    case "mode_requires_active_episode":
      return "El informe de progreso solo puede prepararse sobre un tratamiento activo.";
    case "mode_requires_finished_episode":
      return "El informe de cierre solo puede prepararse sobre un tratamiento finalizado.";
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: AdminPatientTreatmentReportPageProps): Promise<Metadata> {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const patient = await loadPatientDetail(id);
  const mode = parseReportMode(resolvedSearchParams?.mode);

  return {
    title: patient ? `${getPageTitle(mode)} — ${patient.fullName}` : getPageTitle(mode),
  };
}

export default async function AdminPatientTreatmentReportPage({
  params,
  searchParams,
}: AdminPatientTreatmentReportPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const mode = parseReportMode(resolvedSearchParams?.mode);
  const episodeId = resolvedSearchParams?.episodeId?.trim() ?? "";
  const patient = await loadPatientDetail(id);

  if (!patient) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver a pacientes
        </Link>

        <h1 className="mt-3 text-xl font-semibold text-slate-900">Informe de tratamiento</h1>
        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontro el paciente solicitado.
        </p>
      </section>
    );
  }

  if (!mode || !episodeId) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${patient.id}/treatment`}
        >
          ← Volver a tratamiento
        </Link>

        <h1 className="mt-3 text-xl font-semibold text-slate-900">{getPageTitle(mode)}</h1>
        <p className="mt-4 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {getFailureMessage(!mode ? "missing_mode" : "missing_episode_id")}
        </p>
      </section>
    );
  }

  const result = await loadTreatmentReportContext({
    patientId: patient.id,
    episodeId,
    mode,
  });

  if (!result.ok) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${patient.id}/treatment`}
        >
          ← Volver a tratamiento
        </Link>

        <h1 className="mt-3 text-xl font-semibold text-slate-900">{getPageTitle(mode)}</h1>
        <p className="mt-4 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {getFailureMessage(result.reason)}
        </p>
      </section>
    );
  }

  const context = result.context;
  const report = composeTreatmentReport(context);

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href={`/admin/patients/${patient.id}/treatment`}
      >
        ← Volver a tratamiento
      </Link>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Paciente</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{context.patient.displayName}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === "closure" ? "Informe derivado de cierre del episodio." : "Informe derivado de progreso del episodio activo."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Datos fuente del episodio</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-medium">Tipo de informe:</span> {mode === "closure" ? "Cierre" : "Progreso"}</p>
            <p><span className="font-medium">Estado del tratamiento:</span> {context.episode.status === "active" ? "Activo" : "Finalizado"}</p>
            <p><span className="font-medium">Inicio:</span> {formatDateDisplay(context.episode.startDate)}</p>
            {context.episode.endDate ? (
              <p><span className="font-medium">Cierre:</span> {formatDateDisplay(context.episode.endDate)}</p>
            ) : null}
            {context.episode.closureReasonLabel ? (
              <p><span className="font-medium">Motivo de cierre:</span> {context.episode.closureReasonLabel}</p>
            ) : null}
            {context.episode.closureDetail ? (
              <p><span className="font-medium">Detalle de cierre:</span> {context.episode.closureDetail}</p>
            ) : null}
            <p><span className="font-medium">Episodio:</span> {context.episode.id}</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contexto clinico y sesiones</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-medium">Diagnostico medico:</span> {context.clinicalContext?.medicalReferenceDiagnosisText || "No registrado"}</p>
            <p><span className="font-medium">Diagnostico kinesico:</span> {context.clinicalContext?.kinesiologicDiagnosisText || "No registrado"}</p>
            <p><span className="font-medium">Situacion funcional inicial:</span> {context.clinicalContext?.initialFunctionalStatus || "No registrada"}</p>
            <p><span className="font-medium">Objetivos:</span> {context.clinicalContext?.therapeuticGoals || "No registrados"}</p>
            <p><span className="font-medium">Plan marco:</span> {context.clinicalContext?.frameworkPlan || "No registrado"}</p>
            <p><span className="font-medium">Sesiones del episodio:</span> {context.encounterSummary.count}</p>
            {context.encounterSummary.firstVisitStartedAt ? (
              <p><span className="font-medium">Primera sesion:</span> {formatDateDisplay(context.encounterSummary.firstVisitStartedAt)}</p>
            ) : null}
            {context.encounterSummary.lastVisitStartedAt ? (
              <p><span className="font-medium">Ultima sesion:</span> {formatDateDisplay(context.encounterSummary.lastVisitStartedAt)}</p>
            ) : null}
          </div>
        </section>
      </div>

      {context.functionalTrend.length > 0 ? (
        <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Metricas funcionales disponibles</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {context.functionalTrend.map((metric) => (
              <li className="rounded border border-slate-200 bg-white px-3 py-2" key={metric.code}>
                <p className="font-medium text-slate-900">{metric.label}</p>
                <p className="mt-1">{formatFunctionalValue(metric.code, metric.latestValue)}</p>
                {typeof metric.delta === "number" ? (
                  <p className="mt-1 text-xs text-slate-600">Cambio vs previo: {formatFunctionalDelta(metric.code, metric.delta)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-5">
        <TreatmentReportEditor
          episodeId={context.episode.id}
          mode={mode}
          patientId={context.patient.id}
          report={report}
        />
      </div>
    </section>
  );
}
