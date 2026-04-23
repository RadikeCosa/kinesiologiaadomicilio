export const MAIN_CONTACT_RELATIONSHIP_CODES = [
  "parent",
  "spouse",
  "child",
  "sibling",
  "caregiver",
  "other",
] as const;

export type MainContactRelationship = (typeof MAIN_CONTACT_RELATIONSHIP_CODES)[number];

const RELATIONSHIP_ALIASES: Record<string, MainContactRelationship> = {
  parent: "parent",
  padre: "parent",
  madre: "parent",
  mama: "parent",
  mamá: "parent",
  papa: "parent",
  papá: "parent",
  spouse: "spouse",
  esposo: "spouse",
  esposa: "spouse",
  conyuge: "spouse",
  cónyuge: "spouse",
  pareja: "spouse",
  child: "child",
  hijo: "child",
  hija: "child",
  sibling: "sibling",
  hermano: "sibling",
  hermana: "sibling",
  caregiver: "caregiver",
  cuidador: "caregiver",
  cuidadora: "caregiver",
  acompanante: "caregiver",
  acompañante: "caregiver",
  other: "other",
  otro: "other",
  otra: "other",
};

function normalizeForLookup(value: string): string {
  return value.trim().toLocaleLowerCase("es-AR");
}

export function normalizeMainContactRelationship(value?: string): MainContactRelationship | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeForLookup(value);

  if (!normalized) {
    return undefined;
  }

  return RELATIONSHIP_ALIASES[normalized] ?? "other";
}
