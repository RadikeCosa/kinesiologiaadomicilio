import type { Metadata } from "next";
import Link from "next/link";

import { PatientAdministrativeEditor } from "@/app/admin/patients/[id]/components/PatientAdministrativeEditor";
import { PatientIdentityHeaderCard } from "@/app/admin/patients/[id]/components/PatientIdentityHeaderCard";
import { PatientServiceRequestsSection } from "@/app/admin/patients/[id]/administrative/components/PatientServiceRequestsSection";
import { loadPatientAdministrativeContext, loadPatientServiceRequestHistoryContext } from "@/app/admin/patients/[id]/data";
import { getTreatmentBadgePresentation } from "@/app/admin/patients/treatment-badge";
import {
  calculateAgeFromBirthDate,
} from "@/lib/patient-admin-display";
import { getMissingTreatmentStartRequirements } from "@/domain/patient/patient.rules";

interface AdminPatientAdministrativePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ newServiceRequest?: string; editAdministrative?: string; status?: string }>;
}

export async function generateMetadata({
  params,
}: AdminPatientAdministrativePageProps): Promise<Metadata> {
  const { id } = await params;
  const { patient } = await loadPatientAdministrativeContext(id);

  return {
    title: patient
      ? `Datos administrativos — ${patient.fullName}`
      : "Datos administrativos",
  };
}

export default async function AdminPatientAdministrativePage({
  params,
  searchParams,
}: AdminPatientAdministrativePageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const initialCreateOpen = resolvedSearchParams?.newServiceRequest === "1";
  const initialAdministrativeEditing = resolvedSearchParams?.editAdministrative === "1";
  const shouldShowIntakePartialMessage = resolvedSearchParams?.status === "intake-partial";
  const { patient, serviceRequests } = await loadPatientAdministrativeContext(id);
  const serviceRequestHistoryContext = patient
    ? await loadPatientServiceRequestHistoryContext(patient.id)
    : { activeServiceRequest: null, historicalServiceRequests: [] };
  const patientAge = patient ? calculateAgeFromBirthDate(patient.birthDate) : null;
  const treatmentBadge = patient
    ? getTreatmentBadgePresentation(patient.operationalStatus)
    : null;
  const hasActiveTreatment = patient?.operationalStatus === "active_treatment" || Boolean(patient?.activeEpisode);
  const serviceRequestContextMessage = hasActiveTreatment
    ? "Las solicitudes quedan como antecedente administrativo; las visitas se gestionan desde Gestión clínica."
    : "El próximo paso operativo es registrar o aceptar una solicitud de atención.";
  const missingTreatmentRequirements = patient
    ? getMissingTreatmentStartRequirements(patient).map((reason) => {
      switch (reason) {
        case "missing_patient_address":
          return "Domicilio de atención";
        case "missing_contact_phone":
          return "Teléfono del paciente o del contacto principal";
        default:
          return "Nombre y apellido del paciente";
      }
    })
    : [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <header>
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          href={`/admin/patients/${id}`}
        >
          ← Volver al paciente
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">
          Gestión administrativa
        </h1>
        {patient ? (
          <p className="mt-1 text-sm text-slate-600">
            Gestión administrativa de identidad y contacto de{" "}
            {patient.fullName}
          </p>
        ) : null}
      </header>

      {patient ? (
        <>
          {shouldShowIntakePartialMessage ? (
            <p className="mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Se creó el paciente, pero la solicitud inicial no se pudo registrar. Completala manualmente desde esta sección.
            </p>
          ) : null}

          <div className="mt-4">
            <PatientIdentityHeaderCard
              fullName={patient.fullName}
              treatmentBadgeClassName={treatmentBadge?.className ?? ""}
              treatmentBadgeLabel={treatmentBadge?.label ?? ""}
              dni={patient.dni}
              age={patientAge}
            />
          </div>

          <div className="mt-3 text-xs text-slate-600">
            <span>Si necesitás revisar evolución o contexto clínico, usá </span>
            <Link className="font-medium text-slate-700 underline-offset-2 hover:underline" href={`/admin/patients/${patient.id}/encounters`}>Gestión clínica</Link>
            <span> o </span>
            <Link className="font-medium text-slate-700 underline-offset-2 hover:underline" href={`/admin/patients/${patient.id}/treatment`}>Tratamiento</Link>
            <span>.</span>
          </div>

                    <div className="mt-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Resumen administrativo
              </h2>
              <div className="mt-3">
                <PatientAdministrativeEditor initialEditing={initialAdministrativeEditing} patient={patient} />
              </div>
            </section>
          </div>

          <PatientServiceRequestsSection
            contextualMessage={serviceRequestContextMessage}
            initialCreateOpen={initialCreateOpen}
            missingTreatmentRequirements={missingTreatmentRequirements}
            patientAdministrativeSnapshot={{
              address: patient.address,
              phone: patient.phone,
              mainContactPhone: patient.mainContact?.phone,
            }}
            patientId={patient.id}
            activeServiceRequest={serviceRequestHistoryContext.activeServiceRequest}
            historicalServiceRequests={serviceRequestHistoryContext.historicalServiceRequests}
            serviceRequests={serviceRequests}
          />

        </>
      ) : (
        <>
          <Link
            className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
            href="/admin/patients"
          >
            ← Volver a pacientes
          </Link>
          <p className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            No se encontró el paciente solicitado.
          </p>
        </>
      )}
    </section>
  );
}
