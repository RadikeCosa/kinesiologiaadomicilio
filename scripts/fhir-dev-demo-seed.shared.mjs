import {
  DEMO_PATIENT_SCENARIOS,
  buildDemoFhirResourceGroups,
  buildDemoFhirResourcesFlat,
} from "./fhir-dev-demo-seed.data.mjs";

export const SAFE_FHIR_DEV_BASE_URL = "http://localhost:8081/fhir";

export function assertSafeFhirBaseUrl(rawBaseUrl) {
  const value = typeof rawBaseUrl === "string" ? rawBaseUrl.trim() : "";

  if (!value) {
    throw new Error(
      "FHIR_BASE_URL is required and must be exactly http://localhost:8081/fhir for the demo seed.",
    );
  }

  if (value === "http://localhost:8080/fhir") {
    throw new Error("Refusing to run demo seed against localhost:8080. Use the disposable dev/test endpoint only.");
  }

  if (value !== SAFE_FHIR_DEV_BASE_URL) {
    throw new Error(
      `Refusing to run demo seed against "${value}". Allowed endpoint: ${SAFE_FHIR_DEV_BASE_URL}.`,
    );
  }

  return value;
}

export function buildSeedManifest() {
  const groups = buildDemoFhirResourceGroups();
  const flatResources = buildDemoFhirResourcesFlat();

  return {
    safeBaseUrl: SAFE_FHIR_DEV_BASE_URL,
    resourceCounts: {
      practitioner: groups.practitioner.length,
      patients: groups.patients.length,
      serviceRequests: groups.serviceRequests.length,
      conditions: groups.conditions.length,
      episodes: groups.episodes.length,
      encounters: groups.encounters.length,
      observations: groups.observations.length,
      total: flatResources.length,
    },
    scenarioSummaries: DEMO_PATIENT_SCENARIOS.map((scenario) => ({
      code: scenario.code,
      label: scenario.label,
      patientId: scenario.patient.id,
      patientName: `${scenario.patient.firstName} ${scenario.patient.lastName}`,
      summary: scenario.summary,
    })),
  };
}

export function formatSeedManifest(manifest, baseUrl) {
  const lines = [
    "FHIR dev demo seed plan",
    `- Endpoint verificado: ${baseUrl}`,
    "- Seguridad: solo permitido sobre http://localhost:8081/fhir",
    "- Estrategia: PUT idempotente con ids demo controlados; no hace reset ni delete.",
    "- Recursos que sembraria:",
    `  Practitioner: ${manifest.resourceCounts.practitioner}`,
    `  Patient: ${manifest.resourceCounts.patients}`,
    `  ServiceRequest: ${manifest.resourceCounts.serviceRequests}`,
    `  Condition: ${manifest.resourceCounts.conditions}`,
    `  EpisodeOfCare: ${manifest.resourceCounts.episodes}`,
    `  Encounter: ${manifest.resourceCounts.encounters}`,
    `  Observation: ${manifest.resourceCounts.observations}`,
    `  Total: ${manifest.resourceCounts.total}`,
    "- Pacientes demo:",
  ];

  manifest.scenarioSummaries.forEach((scenario) => {
    lines.push(`  ${scenario.patientId} - ${scenario.label} (${scenario.patientName})`);
    lines.push(`    ${scenario.summary}`);
  });

  return lines.join("\n");
}
