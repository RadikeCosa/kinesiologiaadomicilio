"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ServiceRequest } from "@/domain/service-request/service-request.types";
import type { ServiceRequestDisplayStatus, ServiceRequestHistoryItem } from "@/app/admin/patients/[id]/data";
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
  activeServiceRequest?: ServiceRequestHistoryItem | null;
  historicalServiceRequests?: ServiceRequestHistoryItem[];
}

export function getServiceRequestCreateFormVisibility(action: "open" | "cancel"): boolean {
  return action === "open";
}

function getDisplayStatusLabel(displayStatus: ServiceRequestDisplayStatus): string {
  switch (displayStatus) {
    case "accepted_linked_to_treatment":
      return "Aceptada — tratamiento iniciado";
    case "accepted_pending_treatment":
      return "Pendiente de iniciar tratamiento";
    case "in_review":
      return "En evaluación";
    case "closed_without_treatment":
      return "No inició";
    case "cancelled":
      return "Cancelada";
    case "entered_in_error":
      return "Error administrativo";
    default:
      return "En evaluación";
  }
}

function renderServiceRequestCard({ item, patientId, missingTreatmentRequirements }: { item: ServiceRequestHistoryItem; patientId: string; missingTreatmentRequirements: string[]; }) {
  const serviceRequest = item.serviceRequest;
  const isClosedState = serviceRequest.status === "closed_without_treatment" || serviceRequest.status === "cancelled";

  return (
    <li className="rounded-md border border-slate-200 bg-white p-3" key={serviceRequest.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {getServiceRequestStatusLabel(serviceRequest.status)}
        </span>
        <p className="text-xs text-slate-500">Solicitud del {formatDateDisplay(serviceRequest.requestedAt)}</p>
      </div>

      <p className="mt-2 text-xs font-medium text-emerald-700">{getDisplayStatusLabel(item.displayStatus)}.</p>

      <dl className="mt-2 grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Motivo de consulta</dt>
          <dd className="mt-1">{serviceRequest.reasonText}</dd>
        </div>
        {isClosedState ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {serviceRequest.status === "closed_without_treatment" ? "Motivo de no inicio" : "Motivo de cancelación"}
            </dt>
            <dd className="mt-1 text-slate-700">{serviceRequest.closedReasonText ?? "Motivo no registrado"}</dd>
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
      </dl>

      <ServiceRequestStatusActions
        currentStatus={serviceRequest.status}
        displayStatus={item.displayStatus}
        missingTreatmentRequirements={serviceRequest.status === "in_review" ? missingTreatmentRequirements : []}
        patientId={patientId}
        serviceRequestId={serviceRequest.id}
      />
    </li>
  );
}

export function PatientServiceRequestsSection({ patientId, serviceRequests, patientAdministrativeSnapshot, missingTreatmentRequirements = [], initialCreateOpen = false, contextualMessage, activeServiceRequest = null, historicalServiceRequests = [] }: PatientServiceRequestsSectionProps) {
  const router = useRouter();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(initialCreateOpen);
  const { message, setMessage } = useFormFeedback();

  const fallbackItems: ServiceRequestHistoryItem[] = serviceRequests.map((serviceRequest) => ({
    serviceRequest,
    displayStatus: serviceRequest.status === "accepted" ? "accepted_pending_treatment" : serviceRequest.status,
    startedTreatment: false,
    isPendingOperational: serviceRequest.status === "in_review" || serviceRequest.status === "accepted",
  }));
  const fallbackActive = fallbackItems.find((item) => item.serviceRequest.status === "in_review")
    ?? fallbackItems.find((item) => item.serviceRequest.status === "accepted")
    ?? null;
  const effectiveActiveServiceRequest = activeServiceRequest ?? (historicalServiceRequests.length === 0 ? fallbackActive : null);
  const effectiveHistoricalServiceRequests = historicalServiceRequests.length > 0
    ? historicalServiceRequests
    : fallbackItems.filter((item) => item.serviceRequest.id !== effectiveActiveServiceRequest?.serviceRequest.id);

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4" id="service-requests">
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
        <>
          {effectiveActiveServiceRequest ? (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
              Solicitud activa a resolver: {formatDateDisplay(effectiveActiveServiceRequest.serviceRequest.requestedAt)}.
            </p>
          ) : null}
          {effectiveActiveServiceRequest ? <ul className="mt-3 space-y-3">{renderServiceRequestCard({ item: effectiveActiveServiceRequest, patientId, missingTreatmentRequirements })}</ul> : null}
          {effectiveHistoricalServiceRequests.length > 0 ? (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Historial de solicitudes</p>
              <ul className="mt-2 space-y-3">
                {effectiveHistoricalServiceRequests.map((item) => renderServiceRequestCard({ item, patientId, missingTreatmentRequirements }))}
              </ul>
            </>
          ) : null}
          {effectiveHistoricalServiceRequests.length > 0 ? (
            <p className="mt-2 text-xs text-slate-500">Histórico de solicitudes: {effectiveHistoricalServiceRequests.length}</p>
          ) : null}
        </>
      )}
    </section>
  );
}
