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
    label: "Sin tratamiento activo",
    className: "border-slate-300 bg-white text-slate-700",
  },
  ready_to_start: {
    label: "Sin tratamiento activo",
    className: "border-slate-300 bg-white text-slate-700",
  },
  active_treatment: {
    label: "En tratamiento",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  finished_treatment: {
    label: "Tratamiento finalizado",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

export function getTreatmentBadgePresentation(
  operationalStatus: PatientOperationalStatus,
): TreatmentBadgePresentation {
  return TREATMENT_BADGES_BY_STATUS[operationalStatus];
}
