"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ServiceRequestStatus } from "@/domain/service-request/service-request.types";
import type { ServiceRequestDisplayStatus } from "@/app/admin/patients/[id]/data";

import { updatePatientServiceRequestStatusAction } from "@/app/admin/patients/[id]/administrative/actions";
import { acceptAndStartTreatmentFromServiceRequestAction } from "@/app/admin/patients/[id]/administrative/actions";
import { markPatientServiceRequestAsEnteredInErrorAction } from "@/app/admin/patients/[id]/administrative/actions";
import { updatePatientServiceRequestRequestedAtAction } from "@/app/admin/patients/[id]/administrative/actions";
import { formatLocalDateInputValue } from "@/lib/date-input";

type CloseLikeStatus = "closed_without_treatment" | "cancelled";
type ActionKind = "accept_and_start_treatment" | "close_without_treatment" | "cancel" | "start_treatment_legacy";

interface ServiceRequestStatusActionsProps {
  patientId: string;
  serviceRequestId: string;
  currentStatus: ServiceRequestStatus;
  displayStatus: ServiceRequestDisplayStatus;
  missingTreatmentRequirements?: string[];
  defaultTreatmentStartDate?: string;
}

interface ActionFeedback {
  tone: "success" | "error";
  text: string;
}

export function getServiceRequestStatusActions(displayStatus: ServiceRequestDisplayStatus): ActionKind[] {
  switch (displayStatus) {
    case "in_review":
      return ["accept_and_start_treatment", "close_without_treatment", "cancel"];
    case "accepted_pending_treatment":
      return ["start_treatment_legacy"];
    default:
      return [];
  }
}

export function canEditServiceRequestRequestedAt(displayStatus: ServiceRequestDisplayStatus): boolean {
  return displayStatus === "in_review" || displayStatus === "accepted_pending_treatment";
}

export function canMarkServiceRequestEnteredInError(displayStatus: ServiceRequestDisplayStatus): boolean {
  return displayStatus === "in_review" || displayStatus === "accepted_pending_treatment";
}

export function getCloseLikeStatusFromAction(action: ActionKind | null): CloseLikeStatus | null {
  if (action === "close_without_treatment") {
    return "closed_without_treatment";
  }

  if (action === "cancel") {
    return "cancelled";
  }

  return null;
}

export function buildAcceptAndStartTreatmentFormData(input: {
  serviceRequestId: string;
  treatmentStartDate: string;
}): FormData {
  const formData = new FormData();
  formData.set("id", input.serviceRequestId);
  formData.set("treatmentStartDate", input.treatmentStartDate);
  return formData;
}

export function resolveInitialTreatmentStartDate(defaultTreatmentStartDate?: string): string {
  const today = formatLocalDateInputValue();

  return defaultTreatmentStartDate && /^\d{4}-\d{2}-\d{2}$/.test(defaultTreatmentStartDate)
    ? defaultTreatmentStartDate
    : today;
}

export async function submitServiceRequestStatusAction(input: {
  patientId: string;
  serviceRequestId: string;
  status: ServiceRequestStatus;
  closedReasonText?: string;
}) {
  const formData = new FormData();
  formData.set("id", input.serviceRequestId);
  formData.set("status", input.status);

  if (input.closedReasonText) {
    formData.set("closedReasonText", input.closedReasonText);
  }

  return updatePatientServiceRequestStatusAction(input.patientId, formData);
}

export async function submitServiceRequestRequestedAtAction(input: {
  patientId: string;
  serviceRequestId: string;
  requestedAt: string;
}) {
  const formData = new FormData();
  formData.set("id", input.serviceRequestId);
  formData.set("requestedAt", input.requestedAt);

  return updatePatientServiceRequestRequestedAtAction(input.patientId, formData);
}

export async function submitMarkServiceRequestEnteredInErrorAction(input: {
  patientId: string;
  serviceRequestId: string;
}) {
  const formData = new FormData();
  formData.set("id", input.serviceRequestId);

  return markPatientServiceRequestAsEnteredInErrorAction(input.patientId, formData);
}

function getActionLabel(action: ActionKind): string {
  switch (action) {
    case "accept_and_start_treatment":
      return "Aceptar e iniciar tratamiento";
    case "close_without_treatment":
      return "No inició";
    case "cancel":
      return "Cancelar";
    case "start_treatment_legacy":
      return "Iniciar tratamiento";
    default:
      return "";
  }
}

export function ServiceRequestStatusActions({
  patientId,
  serviceRequestId,
  currentStatus,
  displayStatus,
  missingTreatmentRequirements = [],
  defaultTreatmentStartDate,
}: ServiceRequestStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeCloseAction, setActiveCloseAction] = useState<ActionKind | null>(null);
  const [closeReasonText, setCloseReasonText] = useState("");
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [isEditingRequestedAt, setIsEditingRequestedAt] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const today = formatLocalDateInputValue();
  const initialTreatmentStartDate = resolveInitialTreatmentStartDate(defaultTreatmentStartDate);
  const [treatmentStartDate, setTreatmentStartDate] = useState(initialTreatmentStartDate);
  const initialRequestedAt = resolveInitialTreatmentStartDate(defaultTreatmentStartDate);
  const [requestedAt, setRequestedAt] = useState(initialRequestedAt);

  useEffect(() => {
    const nextDate = resolveInitialTreatmentStartDate(defaultTreatmentStartDate);
    setTreatmentStartDate(nextDate);
    setRequestedAt(nextDate);
  }, [defaultTreatmentStartDate]);

  const availableActions = getServiceRequestStatusActions(displayStatus);
  const closeStatus = getCloseLikeStatusFromAction(activeCloseAction);
  const canEditRequestedAt = canEditServiceRequestRequestedAt(displayStatus);
  const canDeleteLogically = canMarkServiceRequestEnteredInError(displayStatus);

  if (availableActions.length === 0 && !canEditRequestedAt && !canDeleteLogically) {
    return null;
  }

  function handleDirectAcceptAndStartTreatment() {
    startTransition(async () => {
      const formData = buildAcceptAndStartTreatmentFormData({
        serviceRequestId,
        treatmentStartDate,
      });
      const result = await acceptAndStartTreatmentFromServiceRequestAction(patientId, formData);

      if (result.ok && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }

      if (result.ok) {
        setFeedback({ tone: "success", text: result.message });
        router.refresh();
        return;
      }

      setFeedback({ tone: "error", text: result.message });
    });
  }

  function handleSubmitCloseLike(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!closeStatus) {
      return;
    }

    startTransition(async () => {
      const result = await submitServiceRequestStatusAction({
        patientId,
        serviceRequestId,
        status: closeStatus,
        closedReasonText: closeReasonText,
      });

      if (result.ok) {
        setFeedback({ tone: "success", text: result.message });
        router.refresh();
        return;
      }

      setFeedback({ tone: "error", text: result.message });
    });
  }

  function handleSubmitRequestedAt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await submitServiceRequestRequestedAtAction({
        patientId,
        serviceRequestId,
        requestedAt,
      });

      if (result.ok) {
        setFeedback({ tone: "success", text: result.message });
        setIsEditingRequestedAt(false);
        router.refresh();
        return;
      }

      setFeedback({ tone: "error", text: result.message || "No se pudo actualizar la fecha de la solicitud." });
    });
  }

  function handleMarkEnteredInError() {
    startTransition(async () => {
      const result = await submitMarkServiceRequestEnteredInErrorAction({
        patientId,
        serviceRequestId,
      });

      if (result.ok) {
        setFeedback({ tone: "success", text: result.message });
        setIsDeleteConfirmOpen(false);
        router.refresh();
        return;
      }

      setFeedback({ tone: "error", text: result.message || "No se pudo eliminar la solicitud de atención." });
    });
  }

  return (
    <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Acciones</p>
      {currentStatus === "in_review" && missingTreatmentRequirements.length > 0 ? (
        <div className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
          <p className="font-semibold">Faltan datos para iniciar tratamiento.</p>
          <ul className="ml-4 mt-1 list-disc">
            {missingTreatmentRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a
            className="mt-2 inline-flex underline-offset-2 hover:underline"
            href={`/admin/patients/${patientId}/administrative?editAdministrative=1#patient-edit-form`}
          >
            Completar datos administrativos
          </a>
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {canEditRequestedAt ? (
          <button
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            disabled={isPending}
            onClick={() => {
              setIsEditingRequestedAt((value) => !value);
              setIsDeleteConfirmOpen(false);
              setActiveCloseAction(null);
              setFeedback(null);
            }}
            type="button"
          >
            Editar fecha
          </button>
        ) : null}
        {availableActions.map((action) => {
          if (action === "accept_and_start_treatment") {
            return null;
          }
          if (action === "start_treatment_legacy") {
            return (
              <a
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                href={`/admin/patients/${patientId}/treatment?serviceRequestId=${serviceRequestId}`}
                key={action}
              >
                {getActionLabel(action)}
              </a>
            );
          }

          return (
            <button
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={isPending}
              key={action}
              onClick={() => {
                setActiveCloseAction(action);
                setIsEditingRequestedAt(false);
                setIsDeleteConfirmOpen(false);
                setFeedback(null);
              }}
              type="button"
            >
              {getActionLabel(action)}
            </button>
          );
        })}
        {canDeleteLogically ? (
          <button
            className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            disabled={isPending}
            onClick={() => {
              setIsDeleteConfirmOpen((value) => !value);
              setActiveCloseAction(null);
              setIsEditingRequestedAt(false);
              setFeedback(null);
            }}
            type="button"
          >
            Eliminar carga errónea
          </button>
        ) : null}
      </div>
      {isEditingRequestedAt ? (
        <form className="mt-3 space-y-2" onSubmit={handleSubmitRequestedAt}>
          <label className="block text-sm font-medium text-slate-800" htmlFor={`requestedAt-${serviceRequestId}`}>
            Fecha de la solicitud
          </label>
          <input
            className="w-full rounded border border-slate-300 bg-white p-2 text-sm sm:w-auto"
            id={`requestedAt-${serviceRequestId}`}
            max={today}
            name="requestedAt"
            onChange={(event) => setRequestedAt(event.target.value)}
            required
            type="date"
            value={requestedAt}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Guardando..." : "Guardar fecha"}
            </button>
            <button
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={isPending}
              onClick={() => {
                setIsEditingRequestedAt(false);
                setRequestedAt(initialRequestedAt);
              }}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}
      {availableActions.includes("accept_and_start_treatment") ? (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor={`treatmentStartDate-${serviceRequestId}`}>
            Fecha para iniciar tratamiento
          </label>
          <input
            className="w-full rounded border border-slate-300 bg-white p-2 text-sm sm:w-auto"
            id={`treatmentStartDate-${serviceRequestId}`}
            max={today}
            name="treatmentStartDate"
            onChange={(event) => setTreatmentStartDate(event.target.value)}
            required
            type="date"
            value={treatmentStartDate}
          />
          <p className="text-xs text-slate-500">
            Por defecto usamos la fecha de la solicitud. Podés ajustarla si el tratamiento comenzó otro día.
          </p>
          <button
            className="rounded border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            disabled={isPending}
            onClick={handleDirectAcceptAndStartTreatment}
            type="button"
          >
            {getActionLabel("accept_and_start_treatment")}
          </button>
        </div>
      ) : null}

      {activeCloseAction && closeStatus ? (
        <form className="mt-3 space-y-2" onSubmit={handleSubmitCloseLike}>
          <label className="block text-sm font-medium text-slate-800" htmlFor={`closedReasonText-${serviceRequestId}`}>
            Motivo de cierre/cancelación *
          </label>
          <textarea
            className="w-full rounded border border-slate-300 bg-white p-2 text-sm"
            id={`closedReasonText-${serviceRequestId}`}
            name="closedReasonText"
            onChange={(event) => setCloseReasonText(event.target.value)}
            required
            rows={3}
            value={closeReasonText}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Guardando..." : `Confirmar ${getActionLabel(activeCloseAction)}`}
            </button>
            <button
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={isPending}
              onClick={() => {
                setActiveCloseAction(null);
                setCloseReasonText("");
              }}
              type="button"
            >
              Cancelar operación
            </button>
          </div>
        </form>
      ) : null}
      {isDeleteConfirmOpen ? (
        <div className="mt-3 space-y-2 rounded border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-900">
            Vas a marcar esta solicitud como carga errónea. Usá esta acción solo si fue registrada por error.
          </p>
          <p className="text-xs text-red-800">
            Si la solicitud fue real pero no continuó, usá Cancelar o No inició.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
              disabled={isPending}
              onClick={handleMarkEnteredInError}
              type="button"
            >
              {isPending ? "Guardando..." : "Confirmar eliminación"}
            </button>
            <button
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={isPending}
              onClick={() => setIsDeleteConfirmOpen(false)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <p className={`mt-2 text-sm ${feedback.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
