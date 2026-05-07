import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { getConditionDiagnosisById } from "@/infrastructure/repositories/condition.repository";

export interface EpisodeClinicalContextReadModel {
  medicalReferenceDiagnosisText?: string;
  kinesiologicImpressionText?: string;
  initialFunctionalStatus?: string;
  therapeuticGoals?: string;
  frameworkPlan?: string;
  hasAnyContent: boolean;
}

function getConditionIdByKind(episode: EpisodeOfCare, kind: "medical_reference" | "kinesiologic_impression") {
  return episode.diagnosisReferences?.find((item) => item.kind === kind)?.conditionId;
}

export async function loadEpisodeClinicalContextReadModel(episode: EpisodeOfCare | null): Promise<EpisodeClinicalContextReadModel | null> {
  if (!episode) return null;

  const medicalConditionId = getConditionIdByKind(episode, "medical_reference");
  const kinesiologicConditionId = getConditionIdByKind(episode, "kinesiologic_impression");
  const [medicalDiagnosis, kinesiologicImpression] = await Promise.all([
    medicalConditionId ? getConditionDiagnosisById({ conditionId: medicalConditionId, kind: "medical_reference" }) : Promise.resolve(null),
    kinesiologicConditionId ? getConditionDiagnosisById({ conditionId: kinesiologicConditionId, kind: "kinesiologic_impression" }) : Promise.resolve(null),
  ]);

  const model: EpisodeClinicalContextReadModel = {
    medicalReferenceDiagnosisText: medicalDiagnosis?.text,
    kinesiologicImpressionText: kinesiologicImpression?.text,
    initialFunctionalStatus: episode.clinicalContext?.initialFunctionalStatus,
    therapeuticGoals: episode.clinicalContext?.therapeuticGoals,
    frameworkPlan: episode.clinicalContext?.frameworkPlan,
    hasAnyContent: false,
  };
  model.hasAnyContent = Boolean(
    model.medicalReferenceDiagnosisText
      || model.kinesiologicImpressionText
      || model.initialFunctionalStatus
      || model.therapeuticGoals
      || model.frameworkPlan,
  );

  return model;
}
