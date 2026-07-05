import type { Metadata } from "next";
import Link from "next/link";

import { MapsLinkAction } from "@/app/admin/patients/components/MapsLinkAction";
import { PhoneContactBlock } from "@/app/admin/patients/components/PhoneContactBlock";
import { loadPatientClinicalRecentSummary, loadPatientDetail, loadPatientHubServiceRequestContext } from "@/app/admin/patients/[id]/data";
import { buildPatientHubViewModel } from "@/app/admin/patients/[id]/patient-hub-view-model";
import {
  buildGoogleMapsSearchHref,
  formatAddressDisplay,
} from "@/lib/patient-contact-links";
import {
  calculateAgeFromBirthDate,
  formatContactRelationshipLabel,
} from "@/lib/patient-admin-display";

import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import { ClinicalRecentSummaryCard } from "@/app/admin/patients/[id]/components/ClinicalRecentSummaryCard";
import { PatientIdentityHeaderCard } from "@/app/admin/patients/[id]/components/PatientIdentityHeaderCard";

interface AdminPatientDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ requestCreated?: string }>;
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

export default async function AdminPatientDetailPage({
  params,
  searchParams,
}: AdminPatientDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const patient = await loadPatientDetail(id);
  const serviceRequestContext = patient
    ? await loadPatientHubServiceRequestContext(patient.id)
    : null;
  const clinicalRecentSummary = patient
    ? await loadPatientClinicalRecentSummary(patient.id)
    : null;
  const mapsHref = patient ? buildGoogleMapsSearchHref(patient.address) : null;
  const addressLabel = patient ? formatAddressDisplay(patient.address) : null;
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;
  const treatmentBadge = patient
    ? getTreatmentBadgePresentation(patient.operationalStatus)
    : null;
  const hubViewModel = patient && serviceRequestContext && clinicalRecentSummary
    ? buildPatientHubViewModel({
        patient,
        clinicalRecentSummary,
        serviceRequestContext,
        requestCreated: resolvedSearchParams?.requestCreated === "1",
      })
    : null;
  const hideSecondaryTreatmentLink = Boolean(
    hubViewModel && (hubViewModel.primaryAction.label === "Iniciar tratamiento"),
  );
  const hideSecondaryCreateRequestLink = Boolean(
    hubViewModel && (hubViewModel.primaryAction.label === "Registrar solicitud" || hubViewModel.primaryAction.label === "Revisar solicitud"),
  );

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href="/admin/patients"
      >
        ← Volver a pacientes
      </Link>

      {patient ? (
        <div className="mt-3 space-y-4">
          <PatientIdentityHeaderCard
            fullName={patient.fullName}
            treatmentBadgeClassName={treatmentBadge?.className ?? ""}
            treatmentBadgeLabel={treatmentBadge?.label ?? ""}
            dni={patient.dni}
            age={patientAge}
            treatmentDetail={hubViewModel?.headerStatusDetail}
          />

          {hubViewModel?.missingRequirementLabels.length ? (
            <section className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                {hubViewModel.missingRequirementLabels.map((label) => (
                  <span
                    className="inline-flex items-center rounded-full border border-amber-300 bg-white px-2 py-0.5 text-xs font-medium text-amber-900"
                    key={label}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-3">
              {clinicalRecentSummary && hubViewModel ? (
                <ClinicalRecentSummaryCard
                  patientId={patient.id}
                  summary={clinicalRecentSummary}
                  briefClinicalSignal={hubViewModel.briefClinicalSignal}
                  showCta={false}
                />
              ) : null}

              <section className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800">
                <h2 className="text-sm font-semibold text-slate-900">Contacto operativo</h2>
                <div className="mt-3 grid gap-3">
                  <div className="grid gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Teléfono del paciente
                    </p>
                    <div>
                      <PhoneContactBlock
                        phone={patient.phone}
                        entity="patient"
                        mainContactPhone={patient.mainContact?.phone}
                        allowMainContactFallback={false}
                        phoneLabel="Teléfono del paciente"
                      />
                    </div>
                  </div>

                  {patient.mainContact ? (
                    <div className="grid gap-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Contacto principal
                      </p>
                      <dl className="space-y-1 text-sm text-slate-700">
                        <div>
                          <dt className="font-medium">Nombre</dt>
                          <dd>{patient.mainContact.name ?? "No informado"}</dd>
                        </div>
                        <div>
                          <dt className="font-medium">Vínculo</dt>
                          <dd>{formatContactRelationshipLabel(patient.mainContact.relationship)}</dd>
                        </div>
                      </dl>
                      <div>
                        <PhoneContactBlock
                          phone={patient.mainContact.phone}
                          entity="mainContact"
                          phoneLabel="Teléfono del contacto principal"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Dirección
                    </p>
                    <p className="text-sm text-slate-700">{addressLabel}</p>
                    {mapsHref ? (
                      <MapsLinkAction
                        className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
                        href={mapsHref}
                      />
                    ) : null}
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-3">
              {hubViewModel ? (
                <section className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2">
                  <h2 className="text-sm font-semibold text-sky-950">{hubViewModel.title}</h2>
                  <p className="mt-1 text-sm text-sky-900">{hubViewModel.primaryAction.supportingCopy}</p>
                  <Link
                    className="mt-3 inline-flex items-center justify-center rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    href={hubViewModel.primaryAction.href}
                  >
                    {hubViewModel.primaryAction.label}
                  </Link>
                  {hubViewModel.secondaryAction ? (
                    <Link
                      className="mt-2 inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      href={hubViewModel.secondaryAction.href}
                    >
                      {hubViewModel.secondaryAction.label}
                    </Link>
                  ) : null}
                </section>
              ) : null}

              <section className="rounded-md border border-slate-200 bg-white p-3">
                <h2 className="text-sm font-semibold text-slate-900">Navegación secundaria</h2>
                <div className="mt-2 grid gap-2 sm:grid-cols-1">
                  <Link
                    className="inline-flex items-center justify-center whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    href={`/admin/patients/${patient.id}/encounters`}
                  >
                    Gestión clínica
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    href={`/admin/patients/${patient.id}/administrative`}
                  >
                    Gestión administrativa
                  </Link>
                  {!hideSecondaryTreatmentLink ? (
                    <Link
                      className="inline-flex items-center justify-center whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      href={`/admin/patients/${patient.id}/treatment`}
                    >
                      Tratamiento
                    </Link>
                  ) : null}
                  {!patient.activeEpisode && !hideSecondaryCreateRequestLink ? (
                    <Link
                      className="inline-flex items-center justify-center whitespace-nowrap rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      href={`/admin/patients/${patient.id}/administrative?newServiceRequest=1#service-requests`}
                    >
                      Crear solicitud de atención
                    </Link>
                  ) : null}
                </div>
              </section>
            </aside>
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
