export const ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS = {
  subjective: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective",
  objective: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-objective",
  intervention: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-intervention",
  assessment: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-assessment",
  tolerance: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-tolerance",
  homeInstructions: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-home-instructions",
  nextPlan: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-next-plan",
} as const;

export const ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES = {
  subjective: "clinical-subjective:v1:",
  objective: "clinical-objective:v1:",
  intervention: "clinical-intervention:v1:",
  assessment: "clinical-assessment:v1:",
  tolerance: "clinical-tolerance:v1:",
  homeInstructions: "clinical-home-instructions:v1:",
  nextPlan: "clinical-next-plan:v1:",
} as const;
