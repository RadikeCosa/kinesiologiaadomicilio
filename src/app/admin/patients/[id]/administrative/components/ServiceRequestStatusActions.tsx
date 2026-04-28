"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ServiceRequestStatus } from "@/domain/service-request/service-request.types";

import { updatePatientServiceRequestStatusAction } from "@/app/admin/patients/[id]/administrative/actions";

type CloseLikeStatus = "closed_without_treatment" | "cancelled";
type ActionKind = "accept" | "close_without_treatment" | "cancel";

interface ServiceRequestStatusActionsProps {
  patientId: string;
  serviceRequestId: string;
  currentStatus: ServiceRequestStatus;
}

interface ActionFeedback {
  tone: "success" | "error";
  text: string;
}

export function getServiceRequestStatusActions(status: ServiceRequestStatus): ActionKind[] {
  switch (status) {
    case "in_review":
      return ["accept", "close_without_treatment", "cancel"];
    case "accepted":
      return ["close_without_treatment", "cancel"];
    default:
      return [];
  }
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

function getActionLabel(action: ActionKind): string {
  switch (action) {
    case "accept":
      return "Aceptar";
    case "close_without_treatment":
      return "No inició";
    case "cancel":
      return "Cancelar";
    default:
      return "";
  }
}

export function ServiceRequestStatusActions({
  patientId,
  serviceRequestId,
  currentStatus,
}: ServiceRequestStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeCloseAction, setActiveCloseAction] = useState<ActionKind | null>(null);
  const [closeReasonText, setCloseReasonText] = useState("");
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const availableActions = getServiceRequestStatusActions(currentStatus);
  const closeStatus = getCloseLikeStatusFromAction(activeCloseAction);

  if (availableActions.length === 0) {
    return null;
  }

  function handleDirectAccept() {
    startTransition(async () => {
      const result = await submitServiceRequestStatusAction({
        patientId,
        serviceRequestId,
        status: "accepted",
      });

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
        setActiveCloseAction(null);
        setCloseReasonText("");
        router.refresh();
        return;
      }

      setFeedback({ tone: "error", text: result.message });
    });
  }

  return (
    <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Acciones</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {availableActions.map((action) => {
          if (action === "accept") {
            return (
              <button
                className="rounded border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                disabled={isPending}
                key={action}
                onClick={handleDirectAccept}
                type="button"
              >
                {getActionLabel(action)}
              </button>
            );
          }

          return (
            <button
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={isPending}
              key={action}
              onClick={() => {
                setActiveCloseAction(action);
                setFeedback(null);
              }}
              type="button"
            >
              {getActionLabel(action)}
            </button>
          );
        })}
      </div>

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

      {feedback ? (
        <p className={`mt-2 text-sm ${feedback.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
