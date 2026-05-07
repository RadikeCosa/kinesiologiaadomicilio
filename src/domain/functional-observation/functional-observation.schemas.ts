import { normalizeToFhirDateTime } from "@/lib/fhir/date-time";
import type { FunctionalObservationCode, FunctionalObservationInput, FunctionalObservationStatus } from "@/domain/functional-observation/functional-observation.types";

const VALID_CODES: FunctionalObservationCode[] = ["tug_seconds", "pain_nrs_0_10", "standing_tolerance_minutes"];

function assertObject(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null) throw new Error("functionalObservationInputSchema: se esperaba un objeto.");
  return input as Record<string, unknown>;
}
const reqStr = (v: unknown, f: string) => { if (typeof v !== "string") throw new Error(`${f}: debe ser un string.`); const n=v.trim(); if(!n) throw new Error(`${f}: es obligatorio.`); return n; };
function normalizeCode(v: unknown): FunctionalObservationCode { const c=reqStr(v,"code"); if(!VALID_CODES.includes(c as FunctionalObservationCode)) throw new Error("code: valor inválido."); return c as FunctionalObservationCode; }
function normalizeStatus(v: unknown): FunctionalObservationStatus { if (v===undefined) return "final"; const s=reqStr(v,"status"); if(s!=="final") throw new Error("status: solo se permite final."); return "final"; }
function reqNum(v: unknown): number { if (typeof v!=="number" || Number.isNaN(v)) throw new Error("value: debe ser un número."); return v; }
function validateValueByCode(code: FunctionalObservationCode, value: number): number {
  if (code === "tug_seconds" && !(value > 0 && value <= 300)) throw new Error("value: tug_seconds fuera de rango (>0 y <=300).");
  if (code === "pain_nrs_0_10" && (!Number.isInteger(value) || value < 0 || value > 10)) throw new Error("value: pain_nrs_0_10 debe ser entero de 0 a 10.");
  if (code === "standing_tolerance_minutes" && !(value >= 0 && value <= 240)) throw new Error("value: standing_tolerance_minutes fuera de rango (>=0 y <=240).");
  return value;
}

export const functionalObservationInputSchema = {
  parse(input: unknown): FunctionalObservationInput {
    const record = assertObject(input);
    const code = normalizeCode(record.code);
    return {
      patientId: reqStr(record.patientId, "patientId"),
      encounterId: reqStr(record.encounterId, "encounterId"),
      effectiveDateTime: normalizeToFhirDateTime(reqStr(record.effectiveDateTime, "effectiveDateTime"), "effectiveDateTime"),
      code,
      value: validateValueByCode(code, reqNum(record.value)),
      status: normalizeStatus(record.status),
    };
  },
};
