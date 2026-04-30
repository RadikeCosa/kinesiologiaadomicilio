import { describe, expect, it } from "vitest";

import { mapFhirEpisodeOfCareToDomain } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import {
  applyFinishEpisodeOfCareToFhir,
  mapStartEpisodeOfCareInputToFhir,
} from "@/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper";

describe("episode-of-care mappers", () => {
  it("maps start input to FHIR EpisodeOfCare without referralRequest", () => {
    const mapped = mapStartEpisodeOfCareInputToFhir({
      patientId: "pat-1",
      startDate: "2026-04-17",
    });

    expect(mapped).toEqual({
      resourceType: "EpisodeOfCare",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
    });
  });

  it("maps start input to FHIR EpisodeOfCare with referralRequest", () => {
    const mapped = mapStartEpisodeOfCareInputToFhir({
      patientId: "pat-1",
      startDate: "2026-04-17",
      serviceRequestId: "sr-1",
    });

    expect(mapped).toEqual({
      resourceType: "EpisodeOfCare",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      referralRequest: [{ reference: "ServiceRequest/sr-1" }],
    });
  });

  it("applies finish over an existing FHIR EpisodeOfCare", () => {
    const mapped = applyFinishEpisodeOfCareToFhir(
      {
        resourceType: "EpisodeOfCare",
        id: "epi-1",
        status: "active",
        patient: { reference: "Patient/pat-1" },
        period: { start: "2026-04-01" },
        extension: [{ url: "https://other.local/fhir/StructureDefinition/custom", valueString: "keep" }],
      },
      {
        endDate: "2026-04-17",
        closureReason: "treatment_completed",
        closureDetail: " Se cumplieron objetivos ",
      },
    );

    expect(mapped).toEqual({
      resourceType: "EpisodeOfCare",
      id: "epi-1",
      status: "finished",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-01", end: "2026-04-17" },
      extension: [
        { url: "https://other.local/fhir/StructureDefinition/custom", valueString: "keep" },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason",
          valueCode: "treatment_completed",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail",
          valueString: "Se cumplieron objetivos",
        },
      ],
    });
  });

  it("replaces previous closure extensions without duplicating and preserves unrelated ones", () => {
    const mapped = applyFinishEpisodeOfCareToFhir(
      {
        resourceType: "EpisodeOfCare",
        id: "epi-dup",
        status: "active",
        extension: [
          { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason", valueCode: "administrative_discharge" },
          { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail", valueString: "Detalle anterior" },
          { url: "https://other.local/fhir/StructureDefinition/custom", valueString: "keep" },
        ],
      },
      {
        endDate: "2026-04-17",
        closureReason: "cancelled",
      },
    );

    expect(mapped.extension).toEqual([
      { url: "https://other.local/fhir/StructureDefinition/custom", valueString: "keep" },
      {
        url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason",
        valueCode: "cancelled",
      },
    ]);
  });

  it("maps FHIR EpisodeOfCare to domain", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-1",
      status: "finished",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17", end: "2026-04-29" },
    });

    expect(mapped).toEqual({
      id: "epi-1",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-04-17",
      endDate: "2026-04-29",
      serviceRequestId: undefined,
    });
  });

  it("maps first valid referralRequest reference to serviceRequestId", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-2",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      referralRequest: [
        { reference: "invalid-reference" },
        { reference: "ServiceRequest/sr-valid" },
      ],
    });

    expect(mapped).toMatchObject({
      id: "epi-2",
      serviceRequestId: "sr-valid",
    });
  });

  it("supports referralRequest references with _history", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-3",
      status: "active",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-17" },
      referralRequest: [{ reference: "ServiceRequest/sr-2/_history/4" }],
    });

    expect(mapped.serviceRequestId).toBe("sr-2");
  });

  it("reads closure reason/detail from extension", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-ext",
      status: "finished",
      patient: { reference: "Patient/pat-1" },
      period: { start: "2026-04-01", end: "2026-04-17" },
      extension: [
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason",
          valueCode: "treatment_completed",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail",
          valueString: "Objetivos logrados",
        },
      ],
    });

    expect(mapped.closureReason).toBe("treatment_completed");
    expect(mapped.closureDetail).toBe("Objetivos logrados");
  });

  it("keeps legacy fallback from note and prioritizes extension when both exist", () => {
    const fromLegacy = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-legacy",
      status: "finished",
      note: [
        { text: "closure-reason:v1:lost_to_follow_up" },
        { text: "closure-detail:v1:Paciente interrumpe" },
      ],
    });

    const prioritized = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-priority",
      status: "finished",
      note: [
        { text: "closure-reason:v1:lost_to_follow_up" },
        { text: "closure-detail:v1:Detalle legacy" },
      ],
      extension: [
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason",
          valueCode: "treatment_completed",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail",
          valueString: "Detalle extension",
        },
      ],
    });

    expect(fromLegacy.closureReason).toBe("lost_to_follow_up");
    expect(fromLegacy.closureDetail).toBe("Paciente interrumpe");
    expect(prioritized.closureReason).toBe("treatment_completed");
    expect(prioritized.closureDetail).toBe("Detalle extension");
  });

  it("ignores invalid extension reason and does not break when reason/detail are missing", () => {
    const mapped = mapFhirEpisodeOfCareToDomain({
      resourceType: "EpisodeOfCare",
      id: "epi-invalid",
      status: "finished",
      extension: [{
        url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason",
        valueCode: "invalid_reason",
      }],
    });

    expect(mapped.closureReason).toBeUndefined();
    expect(mapped.closureDetail).toBeUndefined();
  });
});
