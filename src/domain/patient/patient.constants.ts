export const PATIENT_OPERATIONAL_STATUSES = {
  PRELIMINARY: "preliminary",
  READY_TO_START: "ready_to_start",
  ACTIVE_TREATMENT: "active_treatment",
} as const;

export const PATIENT_MIN_REQUIRED_FIELDS = ["firstName", "lastName"] as const;
