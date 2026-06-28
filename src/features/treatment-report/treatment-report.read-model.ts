import { buildFunctionalTrendSummary } from "@/app/admin/patients/[id]/encounters/functional-trend";
import { loadEpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";
import { calculateEncounterStats } from "@/domain/encounter/encounter-stats";
import { EPISODE_OF_CARE_CLOSURE_REASON_LABELS } from "@/domain/episode-of-care/episode-of-care.types";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import { getEpisodeById } from "@/infrastructure/repositories/episode-of-care.repository";
import { listFunctionalObservationsByEncounterIds } from "@/infrastructure/repositories/observation.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import { loadSigningProfessionalConfig } from "@/features/signing-professional/read-models/signing-professional-config.read-model";
import type {
  TreatmentReportContext,
  TreatmentReportEncounterItem,
  TreatmentReportLoadResult,
  TreatmentReportMode,
} from "@/features/treatment-report/treatment-report.types";

interface LoadTreatmentReportContextInput {
  patientId: string;
  episodeId: string;
  mode: TreatmentReportMode;
}

function buildPatientDisplayName(patient: { firstName: string; lastName: string }): string {
  return [patient.firstName, patient.lastName].map((value) => value.trim()).filter(Boolean).join(" ");
}

function getStartedAtTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.NEGATIVE_INFINITY;
  }

  return timestamp;
}

function sortEncountersByDateDesc<T extends { startedAt: string }>(encounters: T[]): T[] {
  return [...encounters].sort((left, right) => getStartedAtTimestamp(right.startedAt) - getStartedAtTimestamp(left.startedAt));
}

function attachFunctionalObservations(params: {
  patientId: string;
  encounters: Awaited<ReturnType<typeof listEncountersByPatientId>>;
  observations: Awaited<ReturnType<typeof listFunctionalObservationsByEncounterIds>>;
}) {
  const encounterIds = new Set(params.encounters.map((encounter) => encounter.id));
  const byEncounterId = new Map<string, NonNullable<(typeof params.encounters)[number]["functionalObservations"]>>();

  params.observations
    .filter((observation) => observation.patientId === params.patientId && encounterIds.has(observation.encounterId))
    .forEach((observation) => {
      const existing = byEncounterId.get(observation.encounterId) ?? [];
      const deduped = new Map<string, (typeof existing)[number]>();

      existing.forEach((item) => {
        deduped.set(item.code, item);
      });

      const current = deduped.get(observation.code);

      if (!current || new Date(observation.effectiveDateTime).getTime() >= new Date(current.effectiveDateTime).getTime()) {
        deduped.set(observation.code, observation);
      }

      byEncounterId.set(observation.encounterId, Array.from(deduped.values()));
    });

  return params.encounters.map((encounter) => ({
    ...encounter,
    functionalObservations: byEncounterId.get(encounter.id) ?? [],
  }));
}

function buildEncounterItems(
  encounters: ReturnType<typeof attachFunctionalObservations>,
): TreatmentReportEncounterItem[] {
  return encounters.map((encounter) => ({
    id: encounter.id,
    startedAt: encounter.startedAt,
    endedAt: encounter.endedAt,
    hasClinicalNote: Boolean(encounter.clinicalNote && Object.values(encounter.clinicalNote).some(Boolean)),
    functionalObservationCount: encounter.functionalObservations?.length ?? 0,
  }));
}

export async function loadTreatmentReportContext(
  input: LoadTreatmentReportContextInput,
): Promise<TreatmentReportLoadResult> {
  const patientId = input.patientId.trim();
  const episodeId = input.episodeId.trim();

  const [patient, episode, signingProfessional] = await Promise.all([
    getPatientById(patientId),
    getEpisodeById(episodeId),
    loadSigningProfessionalConfig(),
  ]);

  if (!patient) {
    return {
      ok: false,
      reason: "missing_patient",
    };
  }

  if (!episode) {
    return {
      ok: false,
      reason: "missing_episode",
    };
  }

  if (episode.patientId !== patient.id) {
    return {
      ok: false,
      reason: "episode_belongs_to_another_patient",
    };
  }

  if (input.mode === "progress" && episode.status !== "active") {
    return {
      ok: false,
      reason: "mode_requires_active_episode",
    };
  }

  if (input.mode === "closure" && episode.status !== "finished") {
    return {
      ok: false,
      reason: "mode_requires_finished_episode",
    };
  }

  const patientEncounters = await listEncountersByPatientId(patient.id);
  const scopedEncounters = sortEncountersByDateDesc(
    patientEncounters.filter((encounter) => encounter.episodeOfCareId === episode.id),
  );
  const scopedEncounterIds = scopedEncounters.map((encounter) => encounter.id);
  const scopedObservations = await listFunctionalObservationsByEncounterIds(scopedEncounterIds);
  const encountersWithFunctional = attachFunctionalObservations({
    patientId: patient.id,
    encounters: scopedEncounters,
    observations: scopedObservations,
  });
  const encounterItems = buildEncounterItems(encountersWithFunctional);
  const chronologicalEncounterItems = [...encounterItems].sort((left, right) => getStartedAtTimestamp(left.startedAt) - getStartedAtTimestamp(right.startedAt));
  const encounterStats = calculateEncounterStats({
    encounters: encountersWithFunctional,
    episodeOfCareId: episode.id,
    episodeStartDate: episode.startDate,
  });
  const clinicalContext = await loadEpisodeClinicalContextReadModel(episode);

  const context: TreatmentReportContext = {
    mode: input.mode,
    patient: {
      id: patient.id,
      displayName: buildPatientDisplayName(patient),
    },
    episode: {
      id: episode.id,
      status: episode.status,
      startDate: episode.startDate,
      endDate: episode.endDate,
      closureReason: episode.closureReason,
      closureReasonLabel: episode.closureReason
        ? EPISODE_OF_CARE_CLOSURE_REASON_LABELS[episode.closureReason]
        : undefined,
      closureDetail: episode.closureDetail,
    },
    clinicalContext,
    encounters: encounterItems,
    encounterSummary: {
      count: encounterItems.length,
      firstVisitStartedAt: chronologicalEncounterItems[0]?.startedAt,
      lastVisitStartedAt: encounterStats.lastStartedAt ?? undefined,
      averageDurationMinutes: encounterStats.averageDurationMinutes,
      totalDurationMinutes: encounterStats.totalDurationMinutes,
      averageDaysBetweenVisits: encounterStats.averageDaysBetweenEpisodeVisits,
    },
    functionalTrend: buildFunctionalTrendSummary(encountersWithFunctional),
    signingProfessional: {
      status: signingProfessional.status,
      fullName: signingProfessional.status === "missing" ? undefined : signingProfessional.fullName,
      roleTitle: signingProfessional.status === "missing" ? undefined : signingProfessional.roleTitle,
      licenseNumber: signingProfessional.status === "missing" ? undefined : signingProfessional.licenseNumber,
      licenseJurisdiction: signingProfessional.status === "missing" ? undefined : signingProfessional.licenseJurisdiction,
      signatureDisplay: signingProfessional.status === "missing" ? undefined : signingProfessional.signatureDisplay,
    },
  };

  return {
    ok: true,
    context,
  };
}
