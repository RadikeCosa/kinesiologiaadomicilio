import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { FunctionalObservation } from "@/domain/functional-observation/functional-observation.types";
import type { Patient } from "@/domain/patient/patient.types";
import { getEncounterById } from "@/infrastructure/repositories/encounter.repository";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { listFunctionalObservationsByEncounterId } from "@/infrastructure/repositories/observation.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import { calculateAgeFromBirthDate, formatContactRelationshipLabel, formatTimeDisplay, normalizePhone } from "@/lib/patient-admin-display";
import { ENCOUNTER_OPERATIONAL_PUNCTUALITY_LABEL } from "@/infrastructure/mappers/encounter/encounter-operational-punctuality.constants";

import { loadSigningProfessionalConfig } from "../signing-professional/read-models/signing-professional-config.read-model";
import type {
  EncounterShareableReportContext,
  VisitShareReportFunctionalMetric,
  VisitShareReportRecipientOption,
} from "./visit-share-report.types";

interface LoadEncounterShareableReportContextInput {
  patientId: string;
  encounterId: string;
}

const FUNCTIONAL_METRIC_LABELS: Record<FunctionalObservation["code"], string> = {
  tug_seconds: "TUG",
  pain_nrs_0_10: "Dolor",
  standing_tolerance_minutes: "Bipedestacion",
  gait_duration_minutes: "Marcha",
};

function getEffectiveEpisode(activeEpisode: EpisodeOfCare | null, latestEpisode: EpisodeOfCare | null): EpisodeOfCare | null {
  return activeEpisode ?? latestEpisode;
}

function calculateDurationMinutes(startedAt: string, endedAt: string | undefined): number | undefined {
  if (!endedAt) {
    return undefined;
  }

  const startedTime = new Date(startedAt).getTime();
  const endedTime = new Date(endedAt).getTime();

  if (Number.isNaN(startedTime) || Number.isNaN(endedTime) || endedTime <= startedTime) {
    return undefined;
  }

  return Math.round((endedTime - startedTime) / 60_000);
}

function hasClinicalContext(episode: EpisodeOfCare): boolean {
  return Boolean(
    episode.clinicalContext?.initialFunctionalStatus?.trim()
    || episode.clinicalContext?.therapeuticGoals?.trim()
    || episode.clinicalContext?.frameworkPlan?.trim()
    || episode.diagnosisReferences?.length,
  );
}

function buildPatientDisplayName(patient: Patient): string {
  return [patient.firstName, patient.lastName].map((part) => part.trim()).filter(Boolean).join(" ");
}

function buildRecipientOptions(patient: Patient): VisitShareReportRecipientOption[] {
  const options: VisitShareReportRecipientOption[] = [];
  const patientPhone = normalizePhone(patient.phone);
  const mainContactPhone = normalizePhone(patient.mainContact?.phone);

  if (patientPhone) {
    options.push({
      kind: "patient",
      displayName: buildPatientDisplayName(patient),
      phone: patientPhone,
      hasWhatsAppCandidate: true,
    });
  }

  if (mainContactPhone) {
    options.push({
      kind: "main_contact",
      displayName: patient.mainContact?.name?.trim() || "Contacto principal",
      relationshipLabel: formatContactRelationshipLabel(patient.mainContact?.relationship),
      phone: mainContactPhone,
      hasWhatsAppCandidate: true,
    });
  }

  return options;
}

function mapFunctionalMetric(observation: FunctionalObservation): VisitShareReportFunctionalMetric {
  return {
    code: observation.code,
    label: FUNCTIONAL_METRIC_LABELS[observation.code],
    value: observation.value,
    unit: observation.code === "pain_nrs_0_10" ? "/10" : observation.unit,
  };
}

export async function loadEncounterShareableReportContext(
  input: LoadEncounterShareableReportContextInput,
): Promise<EncounterShareableReportContext | null> {
  const patientId = input.patientId.trim();
  const encounterId = input.encounterId.trim();

  if (!patientId || !encounterId) {
    return null;
  }

  const [
    patient,
    encounter,
    activeEpisode,
    latestEpisode,
    signingProfessional,
  ] = await Promise.all([
    getPatientById(patientId),
    getEncounterById(encounterId),
    getActiveEpisodeByPatientId(patientId),
    getMostRecentEpisodeByPatientId(patientId),
    loadSigningProfessionalConfig(),
  ]);

  if (!patient || !encounter || encounter.patientId !== patient.id) {
    return null;
  }

  const effectiveEpisode = getEffectiveEpisode(activeEpisode, latestEpisode);

  if (!effectiveEpisode || encounter.episodeOfCareId !== effectiveEpisode.id) {
    return null;
  }

  const observations = await listFunctionalObservationsByEncounterId(encounterId);
  const functionalMetrics = observations
    .filter((observation) => observation.patientId === patient.id && observation.encounterId === encounter.id)
    .map(mapFunctionalMetric);

  return {
    patient: {
      displayName: buildPatientDisplayName(patient),
      firstName: patient.firstName.trim() || undefined,
      ageYears: calculateAgeFromBirthDate(patient.birthDate, new Date(encounter.startedAt)) ?? undefined,
      recipientOptions: buildRecipientOptions(patient),
    },
    visit: {
      startedAt: encounter.startedAt,
      endedAt: encounter.endedAt,
      startedAtDisplay: formatTimeDisplay(encounter.startedAt),
      endedAtDisplay: encounter.endedAt ? formatTimeDisplay(encounter.endedAt) : undefined,
      durationMinutes: calculateDurationMinutes(encounter.startedAt, encounter.endedAt),
      punctualityLabel: encounter.visitStartPunctuality
        ? ENCOUNTER_OPERATIONAL_PUNCTUALITY_LABEL[encounter.visitStartPunctuality]
        : undefined,
      clinicalNote: encounter.clinicalNote,
      functionalMetrics,
    },
    signingProfessional: {
      status: signingProfessional.status,
      fullName: signingProfessional.fullName,
      roleTitle: signingProfessional.roleTitle,
      licenseNumber: signingProfessional.licenseNumber,
      licenseJurisdiction: signingProfessional.licenseJurisdiction,
      signatureDisplay: signingProfessional.signatureDisplay,
    },
    treatmentContext: {
      hasClinicalContext: hasClinicalContext(effectiveEpisode),
    },
  };
}
