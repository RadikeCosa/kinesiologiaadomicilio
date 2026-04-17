import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

export function extractEpisodeDescriptionFromNotes(note?: FhirEpisodeOfCare["note"]): string | undefined {
  if (!note?.length) {
    return undefined;
  }

  // Convención vigente del slice:
  // la descripción breve se lee desde `EpisodeOfCare.note[*].text` y se consolida
  // en un único string de dominio, sin depender de `note[0]` como contrato rígido.
  const textLines = note
    .map((item) => item.text?.trim())
    .filter((text): text is string => Boolean(text));

  if (!textLines.length) {
    return undefined;
  }

  return textLines.join("\n\n");
}

export function upsertEpisodeDescriptionInNotes(options: {
  note?: FhirEpisodeOfCare["note"];
  description?: string;
}): FhirEpisodeOfCare["note"] {
  // Convención vigente del slice:
  // cuando hay descripción, se asegura su presencia/actualización en `note`
  // manteniendo el recurso chico y explícito para esta etapa.
  const description = options.description?.trim();

  if (!description) {
    return undefined;
  }

  const existingNotes = options.note ?? [];

  if (!existingNotes.length) {
    return [{ text: description }];
  }

  const [firstNote, ...restNotes] = existingNotes;

  return [{ ...firstNote, text: description }, ...restNotes];
}
