import type { ServiceRequestStatus } from "@/domain/service-request/service-request.types";
import type { ServiceRequestDisplayStatus } from "@/app/admin/patients/[id]/data";

export function getServiceRequestStatusLabel(status: ServiceRequestStatus): string {
  switch (status) {
    case "in_review":
      return "En evaluación";
    case "accepted":
      return "Aceptada";
    case "closed_without_treatment":
      return "No inició";
    case "cancelled":
      return "Cancelada";
    case "entered_in_error":
      return "Error de carga";
    default:
      return "En evaluación";
  }
}

interface StatusPresentation {
  label: string;
  className: string;
}

interface ServiceRequestCardPresentation {
  requestStatus: StatusPresentation;
  clinicalStatus: StatusPresentation | null;
  isActionable: boolean;
}

export function getServiceRequestCardPresentation(
  displayStatus: ServiceRequestDisplayStatus,
  requestStatus: ServiceRequestStatus,
): ServiceRequestCardPresentation {
  const baseRequestLabel = getServiceRequestStatusLabel(requestStatus);

  switch (displayStatus) {
    case "accepted_linked_active_treatment":
      return {
        requestStatus: {
          label: baseRequestLabel,
          className: "border-emerald-200 bg-emerald-50 text-emerald-900",
        },
        clinicalStatus: {
          label: "Tratamiento activo",
          className: "border-emerald-200 bg-emerald-50 text-emerald-900",
        },
        isActionable: false,
      };
    case "accepted_linked_finished_treatment":
      return {
        requestStatus: {
          label: baseRequestLabel,
          className: "border-slate-300 bg-slate-100 text-slate-700",
        },
        clinicalStatus: {
          label: "Tratamiento finalizado",
          className: "border-amber-200 bg-amber-50 text-amber-900",
        },
        isActionable: false,
      };
    case "accepted_pending_treatment":
      return {
        requestStatus: {
          label: baseRequestLabel,
          className: "border-sky-200 bg-sky-50 text-sky-900",
        },
        clinicalStatus: {
          label: "Pendiente de iniciar tratamiento",
          className: "border-amber-200 bg-amber-50 text-amber-900",
        },
        isActionable: true,
      };
    case "in_review":
      return {
        requestStatus: {
          label: baseRequestLabel,
          className: "border-sky-200 bg-sky-50 text-sky-900",
        },
        clinicalStatus: null,
        isActionable: true,
      };
    case "closed_without_treatment":
    case "cancelled":
      return {
        requestStatus: {
          label: baseRequestLabel,
          className: "border-slate-300 bg-slate-100 text-slate-700",
        },
        clinicalStatus: null,
        isActionable: false,
      };
    case "entered_in_error":
      return {
        requestStatus: {
          label: baseRequestLabel,
          className: "border-red-200 bg-red-50 text-red-800",
        },
        clinicalStatus: null,
        isActionable: false,
      };
    default:
      return {
        requestStatus: {
          label: baseRequestLabel,
          className: "border-slate-300 bg-slate-100 text-slate-700",
        },
        clinicalStatus: null,
        isActionable: false,
      };
  }
}
