import type { PatientGender } from "@/domain/patient/patient.types";

const GENDER_LABELS: Record<PatientGender, string> = {
  male: "Hombre",
  female: "Mujer",
  other: "Otro",
  unknown: "Desconocido",
};

export function formatGenderLabel(gender?: PatientGender): string {
  if (!gender) {
    return "No informado";
  }

  return GENDER_LABELS[gender];
}

export function normalizeDni(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\D+/g, "");
}

export function formatDniDisplay(dni: string | null | undefined): string {
  const normalized = normalizeDni(dni);

  if (!normalized) {
    return "No informado";
  }

  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function normalizePhone(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();

  if (!trimmed) {
    return "";
  }

  const withInternationalPrefix = trimmed.replace(/^00/, "+");
  const withoutCommonSeparators = withInternationalPrefix.replace(/[\s().-]+/g, "");

  if (!withoutCommonSeparators) {
    return "";
  }

  if (withoutCommonSeparators.startsWith("+")) {
    const digits = withoutCommonSeparators.slice(1).replace(/\D+/g, "");
    return digits ? `+${digits}` : "";
  }

  return withoutCommonSeparators.replace(/\D+/g, "");
}

function getPhoneDigits(phone: string | null | undefined): string {
  return normalizePhone(phone).replace(/\D+/g, "");
}

interface ParsedDateValue {
  date: Date;
  isDateOnly: boolean;
}

function parseDateValue(value: string | Date | null | undefined): ParsedDateValue | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return { date: value, isDateOnly: false };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
      parsed.getUTCFullYear() !== year
      || parsed.getUTCMonth() !== month - 1
      || parsed.getUTCDate() !== day
    ) {
      return null;
    }

    return { date: parsed, isDateOnly: true };
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return { date: parsed, isDateOnly: false };
}

export function formatDateDisplay(date: string | Date | null | undefined): string {
  const parsed = parseDateValue(date);

  if (!parsed) {
    return "No informado";
  }

  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(parsed.isDateOnly ? { timeZone: "UTC" } : {}),
  });

  return formatter.format(parsed.date);
}

export function formatTimeDisplay(dateTime: string | Date | null | undefined): string {
  const parsed = parseDateValue(dateTime);

  if (!parsed) {
    return "No informado";
  }

  const formatter = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(parsed.date);
}

export function formatDateTimeDisplay(dateTime: string | Date | null | undefined): string {
  const parsed = parseDateValue(dateTime);

  if (!parsed) {
    return "No informado";
  }

  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(parsed.date);
}

export function formatPhoneDisplay(phone: string | null | undefined): string {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return "No informado";
  }

  if (normalized.startsWith("+54")) {
    const nationalDigits = normalized.slice(3);

    if (nationalDigits.length === 10) {
      return `+54 ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3, 6)}-${nationalDigits.slice(6)}`;
    }

    if (nationalDigits.length === 11) {
      return `+54 ${nationalDigits.slice(0, 4)} ${nationalDigits.slice(4, 7)}-${nationalDigits.slice(7)}`;
    }
  }

  return normalized;
}

export function buildTelHref(phone: string | null | undefined): string | null {
  const normalized = normalizePhone(phone);
  const digits = getPhoneDigits(normalized);

  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  return `tel:${normalized}`;
}

export function buildWhatsAppHref(phone: string | null | undefined): string | null {
  const digits = getPhoneDigits(phone);

  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  return `https://wa.me/${digits}`;
}
