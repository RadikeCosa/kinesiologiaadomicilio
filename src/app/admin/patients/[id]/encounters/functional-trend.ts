import type { Encounter } from "@/domain/encounter/encounter.types";

const FUNCTIONAL_ORDER = ["tug_seconds", "pain_nrs_0_10", "standing_tolerance_minutes", "gait_duration_minutes"] as const;

export type FunctionalCode = typeof FUNCTIONAL_ORDER[number];

const META: Record<FunctionalCode, { label: string; unit: "s" | "min" | "/10" }> = {
  tug_seconds: { label: "TUG", unit: "s" },
  pain_nrs_0_10: { label: "Dolor", unit: "/10" },
  standing_tolerance_minutes: { label: "Bipedestación", unit: "min" },
  gait_duration_minutes: { label: "Marcha", unit: "min" },
};

export interface FunctionalObservationTrendSummary {
  code: FunctionalCode;
  label: string;
  unit: "s" | "min" | "/10";
  latestValue: number;
  latestDate: string;
  previousValue?: number;
  previousDate?: string;
  delta?: number;
}

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeDisplayNumber(code: FunctionalCode, value: number): number {
  if (code === "pain_nrs_0_10" || code === "gait_duration_minutes") {
    return Math.round(value);
  }

  return roundToSingleDecimal(value);
}

function formatDisplayNumber(code: FunctionalCode, value: number): string {
  const normalized = normalizeDisplayNumber(code, value);

  if (Object.is(normalized, -0)) {
    return "0";
  }

  return String(normalized);
}

export function buildFunctionalTrendSummary(encounters: Encounter[]): FunctionalObservationTrendSummary[] {
  const grouped = new Map<FunctionalCode, Array<{ value: number; date: string }>>();

  encounters.forEach((enc) => {
    (enc.functionalObservations ?? []).forEach((obs) => {
      if (!FUNCTIONAL_ORDER.includes(obs.code as FunctionalCode)) return;
      const code = obs.code as FunctionalCode;
      const list = grouped.get(code) ?? [];
      list.push({ value: obs.value, date: obs.effectiveDateTime });
      grouped.set(code, list);
    });
  });

  return FUNCTIONAL_ORDER.flatMap((code) => {
    const entries = (grouped.get(code) ?? [])
      .filter((item) => !Number.isNaN(new Date(item.date).getTime()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (entries.length === 0) return [];

    const latest = entries[0];
    const previous = entries[1];

    return [{
      code,
      label: META[code].label,
      unit: META[code].unit,
      latestValue: latest.value,
      latestDate: latest.date,
      previousValue: previous?.value,
      previousDate: previous?.date,
      delta: previous ? latest.value - previous.value : undefined,
    }];
  });
}

export function formatFunctionalValue(code: FunctionalCode, value: number): string {
  const formattedValue = formatDisplayNumber(code, value);
  const unit = META[code].unit;

  if (unit === "/10") return `${formattedValue}/10`;
  return `${formattedValue} ${unit}`;
}

export function formatFunctionalDelta(code: FunctionalCode, delta: number): string {
  const normalizedDelta = normalizeDisplayNumber(code, delta);
  const sign = normalizedDelta > 0 ? "+" : "";
  const formattedValue = formatDisplayNumber(code, normalizedDelta);
  const unit = META[code].unit;

  if (unit === "/10") return `${sign}${formattedValue}`;
  return `${sign}${formattedValue} ${unit}`;
}
