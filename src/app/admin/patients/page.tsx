import Link from "next/link";

import { loadPatientsList } from "@/app/admin/patients/data";
import {
  buildGoogleMapsSearchHref,
  formatAddressDisplay,
} from "@/lib/patient-contact-links";
import { buildTelHref, buildWhatsAppHref, formatDniDisplay, formatPhoneDisplay } from "@/lib/patient-admin-display";

import { getTreatmentBadgePresentation } from "./treatment-badge";

export default async function AdminPatientsPage() {
  const patients = await loadPatientsList();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pacientes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Haz clic en un paciente para ver más detalles o gestionar su
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

      <section className="mt-6 space-y-3">
        {patients.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            No hay pacientes para mostrar.
          </p>
        ) : (
          patients.map((patient) => {
            const treatmentBadge = getTreatmentBadgePresentation(patient.operationalStatus);
            const whatsappHref = buildWhatsAppHref(patient.phone);
            const telHref = buildTelHref(patient.phone);
            const phoneLabel = formatPhoneDisplay(patient.phone);
            const mapsHref = buildGoogleMapsSearchHref(patient.address);
            const addressLabel = formatAddressDisplay(patient.address);

            return (
              <article
                key={patient.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4 sm:gap-y-0">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">
                      <Link
                        className="hover:underline"
                        href={`/admin/patients/${patient.id}`}
                      >
                        {patient.fullName}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-slate-700">
                      Teléfono:{" "}
                      {!whatsappHref && !telHref ? (
                        phoneLabel
                      ) : telHref && !whatsappHref ? (
                        <a
                          className="font-medium text-sky-700 underline-offset-2 hover:underline"
                          href={telHref ?? undefined}
                        >
                          {phoneLabel}
                        </a>
                      ) : (
                        <a
                          className="font-medium text-sky-700 underline-offset-2 hover:underline"
                          href={whatsappHref ?? undefined}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {phoneLabel}
                        </a>
                      )}
                    </p>
                    <p className="text-sm text-slate-700">
                      Dirección:{" "}
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
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="shrink-0 text-xs font-normal text-slate-500">
                      DNI: {formatDniDisplay(patient.dni)}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
                    >
                      {treatmentBadge.label}
                    </span>
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
