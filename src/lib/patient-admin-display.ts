import type { MainContactRelationship } from "@/domain/patient/contact-relationship";
import type { PatientGender } from "@/domain/patient/patient.types";

const ENCOUNTER_STATUS_LABELS = {
  finished: "Registrada",
  "in-progress": "En curso",
  planned: "Planificada",
} as const;

const GENDER_LABELS: Record<PatientGender, string> = {
  male: "Hombre",
  female: "Mujer",
  other: "Otro",
  unknown: "Desconocido",
};

const CONTACT_RELATIONSHIP_LABELS: Record<MainContactRelationship, string> = {
  parent: "Madre/padre",
  spouse: "Pareja/cónyuge",
  child: "Hijo/a",
  sibling: "Hermano/a",
  caregiver: "Cuidador/a",
  other: "Otro",
};

export const CONTACT_RELATIONSHIP_OPTIONS: ReadonlyArray<{
  value: MainContactRelationship;
  label: string;
}> = [
  { value: "parent", label: CONTACT_RELATIONSHIP_LABELS.parent },
  { value: "spouse", label: CONTACT_RELATIONSHIP_LABELS.spouse },
  { value: "child", label: CONTACT_RELATIONSHIP_LABELS.child },
  { value: "sibling", label: CONTACT_RELATIONSHIP_LABELS.sibling },
  { value: "caregiver", label: CONTACT_RELATIONSHIP_LABELS.caregiver },
  { value: "other", label: CONTACT_RELATIONSHIP_LABELS.other },
];

export function formatContactRelationshipLabel(
  value?: MainContactRelationship | null,
): string {
  if (!value) {
    return "No informado";
  }

  return CONTACT_RELATIONSHIP_LABELS[value] ?? "Otro";
}

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

export function calculateAgeFromBirthDate(
  birthDate: string | null | undefined,
  referenceDate: Date = new Date(),
): number | null {
  if (!birthDate) {
    return null;
  }

  const birthDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim());

  if (!birthDateMatch) {
    return null;
  }

  const birthYear = Number(birthDateMatch[1]);
  const birthMonth = Number(birthDateMatch[2]);
  const birthDay = Number(birthDateMatch[3]);

  const parsedBirthDate = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));

  if (
    parsedBirthDate.getUTCFullYear() !== birthYear
    || parsedBirthDate.getUTCMonth() !== birthMonth - 1
    || parsedBirthDate.getUTCDate() !== birthDay
  ) {
    return null;
  }

  if (Number.isNaN(referenceDate.getTime())) {
    return null;
  }

  const referenceYear = referenceDate.getUTCFullYear();
  const referenceMonth = referenceDate.getUTCMonth() + 1;
  const referenceDay = referenceDate.getUTCDate();

  let age = referenceYear - birthYear;
  const hadBirthdayThisYear =
    referenceMonth > birthMonth
    || (referenceMonth === birthMonth && referenceDay >= birthDay);

  if (!hadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 0 ? age : null;
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

export function formatEncounterStatusLabel(status: string | null | undefined): string {
  if (!status) {
    return "No informado";
  }

  return ENCOUNTER_STATUS_LABELS[status as keyof typeof ENCOUNTER_STATUS_LABELS] ?? "No informado";
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
