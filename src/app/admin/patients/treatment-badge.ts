import type { PatientOperationalStatus } from "@/domain/patient/patient.types";

export interface TreatmentBadgePresentation {
  label: string;
  className: string;
}

const TREATMENT_BADGES_BY_STATUS: Record<
  PatientOperationalStatus,
  TreatmentBadgePresentation
> = {
  preliminary: {
    label: "Faltan datos",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  ready_to_start: {
    label: "Preparar inicio",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  active_treatment: {
    label: "En tratamiento",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  finished_treatment: {
    label: "Finalizado",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

export function getTreatmentBadgePresentation(
  operationalStatus: PatientOperationalStatus,
): TreatmentBadgePresentation {
  return TREATMENT_BADGES_BY_STATUS[operationalStatus];
}
