export type FunctionalObservationCode =
  | "tug_seconds"
  | "pain_nrs_0_10"
  | "standing_tolerance_minutes";

export type FunctionalObservationStatus = "final";

export interface FunctionalObservationInput {
  patientId: string;
  encounterId: string;
  effectiveDateTime: string;
  code: FunctionalObservationCode;
  value: number;
  status?: FunctionalObservationStatus;
}

export interface FunctionalObservation {
  id: string;
  patientId: string;
  encounterId: string;
  effectiveDateTime: string;
  code: FunctionalObservationCode;
  value: number;
  unit: string;
  status: FunctionalObservationStatus;
}
