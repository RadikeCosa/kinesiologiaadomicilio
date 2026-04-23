import React from "react";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import {
  buildGoogleMapsSearchHref,
  buildWhatsAppHref,
  formatAddressDisplay,
  formatPhoneDisplay,
} from "@/lib/patient-contact-links";

interface PatientDetailViewProps {
  patient: PatientDetailReadModel | null;
}

const OPERATIONAL_STATUS_LABELS: Record<
  PatientDetailReadModel["operationalStatus"],
  string
> = {
  preliminary: "Identidad incompleta",
  ready_to_start: "Listo para iniciar tratamiento",
  active_treatment: "Tratamiento activo",
  finished_treatment: "Tratamiento finalizado",
};


export function PatientDetailView({ patient }: PatientDetailViewProps) {
  if (!patient) {
    return (
      <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <h2 className="text-lg font-medium">Detalle de paciente</h2>
        <p className="mt-2 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

  const treatmentBadge = getTreatmentBadgePresentation(patient.operationalStatus);
  const latestEpisode = (
    patient as PatientDetailReadModel & { latestEpisode?: EpisodeOfCare | null }
  ).latestEpisode;
  const whatsappHref = buildWhatsAppHref(patient.phone);
  const phoneLabel = formatPhoneDisplay(patient.phone);
  const mapsHref = buildGoogleMapsSearchHref(patient.address);
  const addressLabel = formatAddressDisplay(patient.address);

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Detalle de paciente</h2>

      <div className="mt-4 space-y-4 text-sm text-slate-800">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Identidad</h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="font-medium">Nombre completo</dt>
              <dd>{patient.fullName}</dd>
            </div>
            <div>
              <dt className="font-medium">DNI</dt>
              <dd>{patient.dni ?? "Sin DNI"}</dd>
            </div>
            <div>
              <dt className="font-medium">Gender</dt>
              <dd>{patient.gender ?? "No informado"}</dd>
            </div>
            <div>
              <dt className="font-medium">Fecha de nacimiento</dt>
              <dd>{patient.birthDate ?? "No informada"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="font-medium">Teléfono del paciente</dt>
              <dd>
                {!whatsappHref ? (
                  phoneLabel
                ) : (
                  <a
                    className="font-medium text-sky-700 underline-offset-2 hover:underline"
                    href={whatsappHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {phoneLabel}
                  </a>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Dirección</dt>
              <dd>
                {!mapsHref ? (
                  addressLabel
                ) : (
                  <a
                    className="font-medium text-sky-700 underline-offset-2 hover:underline"
                    href={mapsHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {addressLabel}
                  </a>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Contacto principal</dt>
              <dd className="space-y-1">
                <p>Nombre: {patient.mainContact?.name ?? "No informado"}</p>
                <p>
                  Vínculo: {patient.mainContact?.relationship ?? "No informado"}
                </p>
                <p>Teléfono: {patient.mainContact?.phone ?? "No informado"}</p>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Estado operativo
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm">
              {OPERATIONAL_STATUS_LABELS[patient.operationalStatus]}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
            >
              {treatmentBadge.label}
            </span>
          </div>
        </div>
      </div>

      {patient.activeEpisode ? (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-medium">Tratamiento activo</p>
          <p>Inicio: {patient.activeEpisode.startDate}</p>
        </div>
      ) : null}

      {!patient.activeEpisode && latestEpisode?.status === "finished" ? (
        <div className="mt-4 rounded border border-slate-300 bg-white p-3 text-sm text-slate-800">
          <p className="font-medium">Tratamiento finalizado</p>
          <p>Inicio: {latestEpisode.startDate}</p>
          <p>Finalización: {latestEpisode.endDate ?? "No informada"}</p>
        </div>
      ) : null}
    </section>
  );
}
