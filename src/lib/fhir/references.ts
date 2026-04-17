export function buildPatientReference(patientId: string): string {
  return `Patient/${patientId}`;
}

export function extractIdFromReference(reference?: string): string | undefined {
  if (!reference) {
    return undefined;
  }

  const normalizedReference = reference.replace(/\/$/, "");

  const historyMatch = normalizedReference.match(/\/([^/]+)\/_history\/[^/]+$/);
  if (historyMatch?.[1]) {
    return historyMatch[1];
  }

  const segments = normalizedReference.split("/").filter(Boolean);
  return segments.at(-1);
}
