import Link from "next/link";

import { EncounterCreateForm } from "@/app/admin/patients/[id]/encounters/components/EncounterCreateForm";
import { EncountersList } from "@/app/admin/patients/[id]/encounters/components/EncountersList";
import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";
import { formatDateDisplay } from "@/lib/patient-admin-display";

interface AdminPatientEncountersPageProps {
  params: Promise<{ id: string }>;
}

type TreatmentContext = {
  toneClassName: string;
  title: string;
  detail: string;
};

function buildTreatmentContext(params: {
  activeEpisodeStartDate?: string;
  latestEpisodeStatus?: "active" | "finished";
  latestEpisodeEndDate?: string;
}): TreatmentContext {
  if (params.activeEpisodeStartDate) {
    return {
      toneClassName: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
      title: "Tratamiento activo",
      detail: `Inicio: ${formatDateDisplay(params.activeEpisodeStartDate)}`,
    };
  }

  if (params.latestEpisodeStatus === "finished") {
    return {
      toneClassName: "border-slate-300 bg-slate-100/70 text-slate-800",
      title: "Tratamiento finalizado",
      detail: `Finalización: ${formatDateDisplay(params.latestEpisodeEndDate)}`,
    };
  }

  return {
    toneClassName: "border-amber-200 bg-amber-50/70 text-amber-900",
    title: "Sin tratamiento iniciado",
    detail: "Iniciá un tratamiento para habilitar el registro de visitas.",
  };
}

export default async function AdminPatientEncountersPage({ params }: AdminPatientEncountersPageProps) {
  const { id } = await params;
  const pageData = await loadPatientEncountersPageData(id);

  if (!pageData) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/patients">
          ← Volver al listado
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">Visitas del paciente</h2>

        <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

  const treatmentContext = buildTreatmentContext({
    activeEpisodeStartDate: pageData.activeEpisode?.startDate,
    latestEpisodeStatus: pageData.mostRecentEpisode?.status,
    latestEpisodeEndDate: pageData.mostRecentEpisode?.endDate,
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
            href={`/admin/patients/${pageData.patient.id}`}
          >
            ← Volver al paciente
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">{pageData.patient.fullName}</h1>
          <p className="mt-2 text-sm text-slate-600">Registro y seguimiento de visitas</p>
        </div>
      </div>

      <section
        className={`mt-5 w-full rounded-lg border p-3 text-sm sm:w-auto sm:max-w-xl ${treatmentContext.toneClassName}`}
      >
        <p className="font-medium">{treatmentContext.title}</p>
        <p className="mt-1">
          {treatmentContext.detail}{" "}
          <Link
            className="font-medium underline-offset-2 hover:underline"
            href={`/admin/patients/${pageData.patient.id}/treatment`}
          >
            Ir a gestión de tratamiento
          </Link>
        </p>
      </section>

      <EncounterCreateForm patientId={pageData.patient.id} activeEpisodeId={pageData.activeEpisode?.id ?? null} />
      <EncountersList encounters={pageData.encounters} hasActiveTreatment={Boolean(pageData.activeEpisode)} />
    </section>
  );
}
