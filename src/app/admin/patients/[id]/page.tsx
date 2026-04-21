import Link from "next/link";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";
import {
  buildGoogleMapsSearchHref,
  buildWhatsAppHref,
  formatAddressDisplay,
  formatPhoneDisplay,
} from "@/lib/patient-contact-links";

import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";

interface AdminPatientDetailPageProps {
  params: Promise<{ id: string }>;
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
      detail: `Inicio: ${patient.activeEpisode.startDate}`,
    };
  }

  if (patient.latestEpisode?.status === "finished") {
    return {
      badgeLabel: treatmentBadge.label,
      badgeClassName: treatmentBadge.className,
      detail: `Fin: ${patient.latestEpisode.endDate ?? "No informada"}`,
    };
  }

  return {
    badgeLabel: treatmentBadge.label,
    badgeClassName: treatmentBadge.className,
    detail: null,
  };
}

export default async function AdminPatientDetailPage({
  params,
}: AdminPatientDetailPageProps) {
  const { id } = await params;
  const patient = await loadPatientDetail(id);

  const treatmentSummary = patient ? getTreatmentSummary(patient) : null;
  const whatsappHref = patient ? buildWhatsAppHref(patient.phone) : null;
  const phoneLabel = patient ? formatPhoneDisplay(patient.phone) : null;
  const mapsHref = patient ? buildGoogleMapsSearchHref(patient.address) : null;
  const addressLabel = patient ? formatAddressDisplay(patient.address) : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href="/admin/patients"
      >
        ← Volver al listado
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
                  DNI: {patient.dni ?? "Sin DNI"}
                </p>

                {treatmentSummary?.detail ? (
                  <p className="text-xs text-slate-500">
                    {treatmentSummary.detail}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
                <Link
                  className="inline-flex items-center justify-center whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  href={`/admin/patients/${patient.id}/encounters`}
                >
                  Gestión Clínica
                </Link>
                <Link
                  className="inline-flex items-center justify-center whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  href={`/admin/patients/${patient.id}/administrative`}
                >
                  Gestión Administrativa
                </Link>
              </div>
            </header>

            <div className="mt-4 text-sm text-slate-800">
              <section className="rounded-md border border-slate-200 bg-white p-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Contacto
                </h2>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="font-medium">Teléfono</dt>
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

                  {patient.mainContact ? (
                    <div>
                      <dt className="font-medium">Contacto principal</dt>
                      <dd className="space-y-1">
                        <p>
                          Nombre: {patient.mainContact.name ?? "No informado"}
                        </p>
                        <p>
                          Vínculo:{" "}
                          {patient.mainContact.relationship ?? "No informado"}
                        </p>
                        <p>
                          Teléfono:{" "}
                          {patient.mainContact.phone ?? "No informado"}
                        </p>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            </div>
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
