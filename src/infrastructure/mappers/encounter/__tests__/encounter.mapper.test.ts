import { describe, expect, it } from "vitest";

import { mapFhirEncounterToDomain } from "@/infrastructure/mappers/encounter/encounter-read.mapper";
import {
  mapCreateEncounterInputToFhir,
  mapEncounterTimeRangeUpdate,
} from "@/infrastructure/mappers/encounter/encounter-write.mapper";

describe("encounter mappers", () => {
  it("maps create input to FHIR Encounter period.start/end", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:00:00Z",
    });

    expect(mapped).toEqual({
      resourceType: "Encounter",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: {
        start: "2026-04-17T10:30:00Z",
        end: "2026-04-17T11:00:00Z",
      },
    });
  });

  it("maps clinical note fields to encounter extensions", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:00:00Z",
      clinicalNote: {
        subjective: "Dolor al mover hombro",
        intervention: "Movilización suave",
      },
    });

    expect(mapped.extension).toEqual([
      {
        url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective",
        valueString: "Dolor al mover hombro",
      },
      {
        url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-intervention",
        valueString: "Movilización suave",
      },
    ]);
  });

  it("maps create input with endedAt to FHIR Encounter period.start/end", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:10:00Z",
    });

    expect(mapped.period).toEqual({
      start: "2026-04-17T10:30:00Z",
      end: "2026-04-17T11:10:00Z",
    });
  });

  it("writes operational punctuality extension when provided", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:10:00Z",
      visitStartPunctuality: "delayed",
    });

    expect(mapped.extension).toEqual([
      {
        url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1",
        valueCode: "delayed",
      },
    ]);
  });

  it("does not write operational punctuality extension when empty", () => {
    const mapped = mapCreateEncounterInputToFhir({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:10:00Z",
    });
    expect(mapped.extension).toBeUndefined();
  });

  it("updates start/end preserving existing payload shape", () => {
    const mapped = mapEncounterTimeRangeUpdate(
      {
        resourceType: "Encounter",
        id: "enc-1",
        status: "finished",
        subject: { reference: "Patient/pat-1" },
        episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
        period: {
          start: "2026-04-17T10:30:00Z",
          end: "2026-04-17T11:30:00Z",
        },
        extension: [
          { url: "https://other.local/ext", valueString: "keep" },
          {
            url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-assessment",
            valueString: "Buena evolución",
          },
        ],
      },
      "2026-04-17T10:45:00Z",
      "2026-04-17T11:40:00Z",
    );

    expect(mapped.period).toEqual({
      start: "2026-04-17T10:45:00Z",
      end: "2026-04-17T11:40:00Z",
    });
    expect(mapped.extension).toEqual([
      { url: "https://other.local/ext", valueString: "keep" },
      {
        url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-assessment",
        valueString: "Buena evolución",
      },
    ]);
  });

  it("maps legacy FHIR Encounter with start===end without exposing endedAt", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T10:30:00Z" },
    });

    expect(mapped).toEqual({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      status: "finished",
    });
  });

  it("maps fallback startedAt from period.end when start is missing", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { end: "2026-04-17T10:30:00Z" },
    });

    expect(mapped.startedAt).toBe("2026-04-17T10:30:00Z");
    expect(mapped.endedAt).toBeUndefined();
  });

  it("hides endedAt when external data has end before start", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: {
        start: "2026-04-17T11:00:00Z",
        end: "2026-04-17T10:00:00Z",
      },
    });

    expect(mapped.startedAt).toBe("2026-04-17T11:00:00Z");
    expect(mapped.endedAt).toBeUndefined();
  });

  it("maps clinical note from extensions to domain", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:30:00Z" },
      extension: [
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective",
          valueString: "Refiere mejora",
        },
      ],
    });

    expect(mapped.clinicalNote).toEqual({ subjective: "Refiere mejora" });
  });

  it("falls back to legacy note prefixes only and ignores free note text", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-legacy-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:30:00Z" },
      note: [
        { text: "Evolución espontánea del paciente" },
        { text: "clinical-subjective:v1:Refiere dolor leve" },
      ],
    });

    expect(mapped.clinicalNote).toEqual({ subjective: "Refiere dolor leve" });
  });

  it("reads clinical extensions only on exact URL match", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-ext-1",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:30:00Z" },
      extension: [
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective/v2",
          valueString: "No debe mapear",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective",
          valueString: "Sí debe mapear",
        },
      ],
    });

    expect(mapped.clinicalNote).toEqual({ subjective: "Sí debe mapear" });
  });

  it("maps operational punctuality from exact extension URL and valid code", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-ext-2",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:30:00Z" },
      extension: [{
        url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1",
        valueCode: "on_time_or_minor_delay",
      }],
    });
    expect(mapped.visitStartPunctuality).toBe("on_time_or_minor_delay");
  });

  it("ignores operational punctuality unknown URL/valueCode", () => {
    const mapped = mapFhirEncounterToDomain({
      resourceType: "Encounter",
      id: "enc-ext-3",
      status: "finished",
      subject: { reference: "Patient/pat-1" },
      episodeOfCare: [{ reference: "EpisodeOfCare/epi-1" }],
      period: { start: "2026-04-17T10:30:00Z", end: "2026-04-17T11:30:00Z" },
      extension: [
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v2", valueCode: "delayed" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1", valueCode: "unknown" },
      ],
    });
    expect(mapped.visitStartPunctuality).toBeUndefined();
  });

});
