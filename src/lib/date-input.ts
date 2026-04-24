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
