const FHIR_DATE_TIME_WITH_TIMEZONE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/;

const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatOffset(minutesOffset: number): string {
  const sign = minutesOffset <= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(minutesOffset);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return `${sign}${padNumber(hours)}:${padNumber(minutes)}`;
}

function toFhirDateTimeWithOffset(date: Date): string {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());
  const offset = formatOffset(date.getTimezoneOffset());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;
}

export function normalizeToFhirDateTime(value: string, fieldName = "dateTime"): string {
  const trimmed = value.trim();

  if (FHIR_DATE_TIME_WITH_TIMEZONE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (!LOCAL_DATE_TIME_PATTERN.test(trimmed)) {
    throw new Error(`${fieldName}: formato dateTime inválido.`);
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName}: formato dateTime inválido.`);
  }

  return toFhirDateTimeWithOffset(parsed);
}
