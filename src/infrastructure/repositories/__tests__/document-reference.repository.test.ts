import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { createTreatmentEvolutionReport, listTreatmentEvolutionReportsByPatientId } from "@/infrastructure/repositories/document-reference.repository";

describe("document-reference.repository (FHIR)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a treatment evolution report as DocumentReference", async () => {
    const postSpy = vi.spyOn(fhirClient, "post").mockResolvedValue({
      resourceType: "DocumentReference",
      id: "doc-1",
      subject: { reference: "Patient/pat-1" },
      date: "2026-07-08T12:00:00Z",
      context: { related: [{ reference: "EpisodeOfCare/epi-1" }] },
      extension: [
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-report-type", valueCode: "progress" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-treatment-status-at-report", valueCode: "active" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-episode-start-date", valueDate: "2026-05-01" },
        { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-encounter-count", valueInteger: 3 },
      ],
      content: [{
        attachment: {
          data: Buffer.from("Texto guardado", "utf-8").toString("base64"),
        },
      }],
    });

    const created = await createTreatmentEvolutionReport({
      patientId: "pat-1",
      episodeId: "epi-1",
      createdAt: "2026-07-08T12:00:00Z",
      reportType: "progress",
      treatmentStatusAtReport: "active",
      episodeStartDate: "2026-05-01",
      encounterCount: 3,
      finalText: "Texto guardado",
    });

    expect(postSpy).toHaveBeenCalledWith(
      "DocumentReference",
      expect.objectContaining({
        resourceType: "DocumentReference",
        subject: { reference: "Patient/pat-1" },
      }),
    );
    expect(created).toEqual(expect.objectContaining({
      id: "doc-1",
      patientId: "pat-1",
      episodeId: "epi-1",
      finalText: "Texto guardado",
    }));
  });

  it("lists reports by patient subject", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [{
        resource: {
          resourceType: "DocumentReference",
          id: "doc-1",
          subject: { reference: "Patient/pat-1" },
          date: "2026-07-08T12:00:00Z",
          context: { related: [{ reference: "EpisodeOfCare/epi-1" }] },
          extension: [
            { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-report-type", valueCode: "progress" },
            { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-treatment-status-at-report", valueCode: "active" },
            { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-episode-start-date", valueDate: "2026-05-01" },
            { url: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/documentreference-encounter-count", valueInteger: 3 },
          ],
          content: [{
            attachment: {
              data: Buffer.from("Texto guardado", "utf-8").toString("base64"),
            },
          }],
        },
      }],
    });

    const reports = await listTreatmentEvolutionReportsByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledWith("DocumentReference?subject=Patient%2Fpat-1");
    expect(reports).toHaveLength(1);
    expect(reports[0]).toEqual(expect.objectContaining({
      id: "doc-1",
      patientId: "pat-1",
      episodeId: "epi-1",
    }));
  });
});
