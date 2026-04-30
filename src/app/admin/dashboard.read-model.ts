export type AdminOperationalSummary = {
  totalPatients: number;
  activeTreatment: number;
  finishedTreatment: number;
  withoutStartedTreatment: number;
  preliminary: number;
  readyToStart: number;
};

export type AdminAgeSummary = {
  youngest: number | null;
  oldest: number | null;
  average: number | null;
  withValidBirthDate: number;
  withoutValidBirthDate: number;
  coverage: {
    numerator: number;
    denominator: number;
    percentage: number | null;
  };
  note: string;
};

export type AdminDashboardReadModel = {
  generatedAt: string;
  operationalSummary: AdminOperationalSummary;
  ageSummary: AdminAgeSummary;
  serviceRequestSummary: AdminServiceRequestSummary;
};

export type AdminServiceRequestSummary = {
  inReview: number;
  acceptedPendingTreatment: number;
};
