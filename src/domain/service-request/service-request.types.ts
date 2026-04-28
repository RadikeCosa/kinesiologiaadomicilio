export type ServiceRequestStatus =
  | "in_review"
  | "accepted"
  | "closed_without_treatment"
  | "cancelled"
  | "entered_in_error";

export type ServiceRequestRequesterType =
  | "patient"
  | "family"
  | "caregiver"
  | "physician"
  | "other";

export interface ServiceRequest {
  id: string;
  patientId: string;
  requestedAt: string;
  requesterDisplay?: string;
  requesterType?: ServiceRequestRequesterType;
  requesterContact?: string;
  reasonText: string;
  reportedDiagnosisText?: string;
  status: ServiceRequestStatus;
  closedReasonText?: string;
  notes?: string;
}

export interface CreateServiceRequestInput {
  patientId: string;
  requestedAt: string;
  requesterDisplay?: string;
  requesterType?: ServiceRequestRequesterType;
  requesterContact?: string;
  reasonText: string;
  reportedDiagnosisText?: string;
  notes?: string;
}

export interface UpdateServiceRequestStatusInput {
  id: string;
  status: ServiceRequestStatus;
  closedReasonText?: string;
}
