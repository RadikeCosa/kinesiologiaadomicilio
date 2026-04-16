import type { StartEpisodeOfCareInput } from "@/domain/episode-of-care/episode-of-care.types";

export type EpisodeOfCareWritePayload = {
  // TODO(slice-1/fase-2): definir payload real al integrar FHIR.
  placeholder: true;
  input: StartEpisodeOfCareInput;
};

export function mapEpisodeOfCareInputToWritePayload(
  input: StartEpisodeOfCareInput,
): EpisodeOfCareWritePayload {
  return {
    placeholder: true,
    input,
  };
}
