"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ServiceRequest } from "@/domain/service-request/service-request.types";
import { formatDateDisplay } from "@/lib/patient-admin-display";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { ServiceRequestCreateForm } from "@/app/admin/patients/[id]/administrative/components/ServiceRequestCreateForm";
import { ServiceRequestStatusActions } from "@/app/admin/patients/[id]/administrative/components/ServiceRequestStatusActions";
import { getServiceRequestStatusLabel } from "@/app/admin/patients/[id]/administrative/service-request-status-label";

interface PatientServiceRequestsSectionProps {
  patientId: string;
  serviceRequests: ServiceRequest[];
  patientAdministrativeSnapshot?: {
    address?: string;
    phone?: string;
    mainContactPhone?: string;
  };
  missingTreatmentRequirements?: string[];
  initialCreateOpen?: boolean;
  contextualMessage?: string;
}

export function getServiceRequestCreateFormVisibility(action: "open" | "cancel"): boolean {
  return action === "open";
}

export function PatientServiceRequestsSection({ patientId, serviceRequests, patientAdministrativeSnapshot, missingTreatmentRequirements = [], initialCreateOpen = false, contextualMessage }: PatientServiceRequestsSectionProps) {
  const router = useRouter();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(initialCreateOpen);
  const { message, setMessage } = useFormFeedback();

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4" id="solicitudes">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Solicitudes de atención
        </h2>
        {!isCreateFormOpen ? (
          <button
            className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => setIsCreateFormOpen(getServiceRequestCreateFormVisibility("open"))}
            type="button"
          >
            Nueva solicitud
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-slate-600">
        Registro administrativo de demandas o consultas. No reemplaza tratamiento ni visitas.
      </p>

      {contextualMessage ? (
        <p className="mt-2 rounded-md border border-sky-200 bg-sky-50 p-2 text-xs text-sky-900">
          {contextualMessage}
        </p>
      ) : null}

      {message ? (
        <p className={`mt-2 text-sm ${message.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {message.text}
        </p>
      ) : null}

      {isCreateFormOpen ? (
        <ServiceRequestCreateForm
          onCancel={() => setIsCreateFormOpen(getServiceRequestCreateFormVisibility("cancel"))}
          onSubmitted={(result) => {
            if (result.ok) {
              setMessage({
                tone: "success",
                text: "Solicitud de atención registrada correctamente.",
              });
              setIsCreateFormOpen(false);
              router.refresh();
              return;
            }

            setMessage({
              tone: "error",
              text: result.message || "No se pudo registrar la solicitud de atención.",
            });
          }}
          initialAdministrativeData={patientAdministrativeSnapshot}
          patientId={patientId}
        />
      ) : null}

      {serviceRequests.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">
          Registrá la primera solicitud para dejar asentado el motivo de consulta y avanzar con la evaluación.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {serviceRequests.map((serviceRequest) => {
            const isAccepted = serviceRequest.status === "accepted";
            const isClosedState = serviceRequest.status === "closed_without_treatment" || serviceRequest.status === "cancelled";

            return (
              <li className="rounded-md border border-slate-200 bg-white p-3" key={serviceRequest.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {getServiceRequestStatusLabel(serviceRequest.status)}
                  </span>
                  <p className="text-xs text-slate-500">Solicitud del {formatDateDisplay(serviceRequest.requestedAt)}</p>
                </div>

                {isAccepted ? (
                  <p className="mt-2 text-xs font-medium text-emerald-700">Pendiente de iniciar tratamiento.</p>
                ) : null}

                <dl className="mt-2 grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Motivo de consulta</dt>
                    <dd className="mt-1">{serviceRequest.reasonText}</dd>
                  </div>

                  {isClosedState && serviceRequest.closedReasonText ? (
                    <div className="sm:col-span-2 rounded-md border border-amber-200 bg-amber-50 p-2.5">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-800">Motivo por el que no inició</dt>
                      <dd className="mt-1 text-amber-900">{serviceRequest.closedReasonText}</dd>
                    </div>
                  ) : null}

                  {serviceRequest.reportedDiagnosisText ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Diagnóstico informado</dt>
                      <dd className="mt-1">{serviceRequest.reportedDiagnosisText}</dd>
                    </div>
                  ) : null}

                  {serviceRequest.requesterDisplay ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Solicitante</dt>
                      <dd className="mt-1">{serviceRequest.requesterDisplay}</dd>
                    </div>
                  ) : null}

                  {!isClosedState && serviceRequest.closedReasonText ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Motivo registrado</dt>
                      <dd className="mt-1">{serviceRequest.closedReasonText}</dd>
                    </div>
                  ) : null}
                </dl>

                <ServiceRequestStatusActions
                  currentStatus={serviceRequest.status}
                  missingTreatmentRequirements={serviceRequest.status === "in_review" ? missingTreatmentRequirements : []}
                  patientId={patientId}
                  serviceRequestId={serviceRequest.id}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
