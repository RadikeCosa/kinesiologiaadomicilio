function padDateInputSegment(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatLocalDateInputValue(date: Date = new Date()): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("date: inválida.");
  }

  const year = date.getFullYear();
  const month = padDateInputSegment(date.getMonth() + 1);
  const day = padDateInputSegment(date.getDate());

  return `${year}-${month}-${day}`;
}

export function formatLocalDateTimeInputValue(dateTime: string | Date | null | undefined): string {
  if (!dateTime) {
    return "";
  }

  const parsed = dateTime instanceof Date ? dateTime : new Date(dateTime);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = padDateInputSegment(parsed.getMonth() + 1);
  const day = padDateInputSegment(parsed.getDate());
  const hours = padDateInputSegment(parsed.getHours());
  const minutes = padDateInputSegment(parsed.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
