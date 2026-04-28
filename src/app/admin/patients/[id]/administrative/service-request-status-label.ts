import type { ServiceRequestStatus } from "@/domain/service-request/service-request.types";

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
