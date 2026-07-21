import { describe, expect, it } from "vitest";

import { mapFhirDocumentReferenceToTreatmentEvolutionReport } from "@/infrastructure/mappers/document-reference/document-reference-read.mapper";
import { mapTreatmentEvolutionReportToFhir } from "@/infrastructure/mappers/document-reference/document-reference-write.mapper";

describe("document-reference treatment evolution report mappers", () => {
  it("maps domain snapshot to FHIR DocumentReference", () => {
    const mapped = mapTreatmentEvolutionReportToFhir({
      patientId: "pat-1",
      episodeId: "epi-1",
      createdAt: "2026-07-08T12:00:00Z",
      reportType: "stage_closure",
      treatmentStatusAtReport: "active",
      episodeStartDate: "2026-05-01",
      encounterCount: 5,
      firstEncounterStartedAt: "2026-05-03T10:00:00Z",
      lastEncounterStartedAt: "2026-05-20T10:00:00Z",
      medicalDiagnosisSnapshot: "Lumbalgia",
      kinesiologicDiagnosisSnapshot: "Dolor lumbar mecanico",
      initialFunctionalStatusSnapshot: "Dolor al caminar.",
      therapeuticGoalsSnapshot: "Mejorar tolerancia.",
      frameworkPlanSnapshot: "Plan general.",
      functionalMetricsSummarySnapshot: "Dolor: 4/10",
      finalText: "Texto final del informe",
    });

    expect(mapped).toMatchObject({
      resourceType: "DocumentReference",
      status: "current",
      subject: { reference: "Patient/pat-1" },
      context: { related: [{ reference: "EpisodeOfCare/epi-1" }] },
      date: "2026-07-08T12:00:00Z",
      description: "Cierre de etapa",
    });
    expect(mapped.content?.[0]?.attachment?.data).toBeTruthy();
    expect(mapped.extension?.some((item) => item.valueInteger === 5)).toBe(true);
    expect(mapped.extension?.some((item) => item.valueCode === "stage_closure")).toBe(true);
  });

  it("maps FHIR DocumentReference back to domain snapshot", () => {
    const mapped = mapFhirDocumentReferenceToTreatmentEvolutionReport({
      resourceType: "DocumentReference",
      id: "doc-1",
      status: "current",
      subject: { reference: "Patient/pat-1" },
      date: "2026-07-08T12:00:00Z",
      context: { related: [{ reference: "EpisodeOfCare/epi-1" }] },
      extension: [
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-report-type",
          valueCode: "progress",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-treatment-status-at-report",
          valueCode: "active",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-episode-start-date",
          valueDate: "2026-05-01",
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-encounter-count",
          valueInteger: 5,
        },
        {
          url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-medical-diagnosis-snapshot",
          valueString: "Lumbalgia",
        },
      ],
      content: [{
        attachment: {
          data: Buffer.from("Texto final del informe", "utf-8").toString("base64"),
        },
      }],
    });

    expect(mapped).toEqual(expect.objectContaining({
      id: "doc-1",
      patientId: "pat-1",
      episodeId: "epi-1",
      reportType: "progress",
      treatmentStatusAtReport: "active",
      episodeStartDate: "2026-05-01",
      encounterCount: 5,
      medicalDiagnosisSnapshot: "Lumbalgia",
      finalText: "Texto final del informe",
    }));
  });
});
