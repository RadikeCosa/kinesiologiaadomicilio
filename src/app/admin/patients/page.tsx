import type { Metadata } from "next";
import Link from "next/link";

import { PhoneContactActions } from "@/app/admin/patients/components/PhoneContactBlock";
import { loadPatientsList } from "@/app/admin/patients/data";
import {
  buildGoogleMapsSearchHref,
  formatAddressDisplay,
} from "@/lib/patient-contact-links";
import {
  formatDniDisplay,
  formatPhoneDisplay,
} from "@/lib/patient-admin-display";

import { getTreatmentBadgePresentation } from "./treatment-badge";

export const metadata: Metadata = {
  title: "Pacientes",
};

export default async function AdminPatientsPage() {
  const patients = await loadPatientsList();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pacientes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hacé clic en un paciente para ver más detalles o gestionar su
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

      <section className="mt-4 space-y-2.5">
        {patients.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            No hay pacientes para mostrar.
          </p>
        ) : (
          patients.map((patient) => {
            const treatmentBadge = getTreatmentBadgePresentation(patient.operationalStatus);
            const mapsHref = buildGoogleMapsSearchHref(patient.address);
            const addressLabel = formatAddressDisplay(patient.address);

            return (
              <article
                key={patient.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      <Link
                        className="hover:underline"
                        href={`/admin/patients/${patient.id}`}
                      >
                        {patient.fullName}
                      </Link>
                    </h3>

                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadge.className}`}
                    >
                      {treatmentBadge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <p className="text-xs text-slate-600">
                      DNI: {formatDniDisplay(patient.dni)} · Tel: {formatPhoneDisplay(patient.phone)}
                    </p>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {patient.operationalStatus === "active_treatment" ? (
                        <Link
                          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          href={`/admin/patients/${patient.id}/encounters/new`}
                        >
                          Registrar visita
                        </Link>
                      ) : null}
                      <PhoneContactActions
                        phone={patient.phone}
                        showMissingChannelsMessage={false}
                      />
                    </div>
                  </div>

                  {mapsHref ? (
                    <p className="text-sm text-slate-700">
                      Dirección:{" "}
                      <a
                        className="font-medium text-sky-700 underline-offset-2 hover:underline"
                        href={mapsHref}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {addressLabel}
                      </a>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-700">Dirección: {addressLabel}</p>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}
