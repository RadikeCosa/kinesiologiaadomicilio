"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { createEncounterAction } from "@/app/admin/patients/[id]/encounters/actions/create-encounter.action";
import type { EncounterVisitStartPunctuality } from "@/domain/encounter/encounter.types";
import { formatLocalDateTimeInputValue } from "@/lib/date-input";

interface EncounterCreateFormProps {
  patientId: string;
  activeEpisodeId: string | null;
  treatmentHref?: string;
  successRedirectPath?: string;
}

export function getEncounterCreateInitialDateTime(): string {
  return formatLocalDateTimeInputValue(new Date());
}

export function isEncounterEndBeforeStart(startedAt: string, endedAt: string): boolean {
  if (!startedAt || !endedAt) {
    return false;
  }

  const startedAtTimestamp = new Date(startedAt).getTime();
  const endedAtTimestamp = new Date(endedAt).getTime();

  if (Number.isNaN(startedAtTimestamp) || Number.isNaN(endedAtTimestamp)) {
    return false;
  }

  return endedAtTimestamp < startedAtTimestamp;
}

export function getNextEndedAtOnStartChange(params: {
  nextStartedAt: string;
  currentEndedAt: string;
  hasUserEditedEndedAt: boolean;
}): string {
  if (!params.hasUserEditedEndedAt) {
    return params.nextStartedAt;
  }

  return params.currentEndedAt;
}

export function getPainValueLabel(painNrs010: string): string {
  return painNrs010 === "" ? "Sin cargar" : painNrs010;
}

export function EncounterCreateForm({
  patientId,
  activeEpisodeId,
  treatmentHref,
  successRedirectPath,
}: EncounterCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { message, setMessage } = useFormFeedback();
  const [startedAt, setStartedAt] = useState(getEncounterCreateInitialDateTime);
  const [endedAt, setEndedAt] = useState(startedAt);
  const [hasUserEditedEndedAt, setHasUserEditedEndedAt] = useState(false);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [intervention, setIntervention] = useState("");
  const [assessment, setAssessment] = useState("");
  const [tolerance, setTolerance] = useState("");
  const [homeInstructions, setHomeInstructions] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const [isClinicalNoteExpanded, setIsClinicalNoteExpanded] = useState(false);
  const [tugSeconds, setTugSeconds] = useState("");
  const [painNrs010, setPainNrs010] = useState("");
  const [standingToleranceMinutes, setStandingToleranceMinutes] = useState("");
  const [gaitDurationMinutes, setGaitDurationMinutes] = useState("");
  const [visitStartPunctuality, setVisitStartPunctuality] = useState<EncounterVisitStartPunctuality | "">("");

  const canCreateEncounter = Boolean(activeEpisodeId);

  function validateTimeRange(nextStartedAt: string, nextEndedAt: string): string | null {
    if (isEncounterEndBeforeStart(nextStartedAt, nextEndedAt)) {
      return "El cierre debe ser igual o posterior al inicio.";
    }

    return null;
  }

  function handleStartedAtChange(nextStartedAt: string) {
    setStartedAt(nextStartedAt);

    const nextEndedAt = getNextEndedAtOnStartChange({
      nextStartedAt,
      currentEndedAt: endedAt,
      hasUserEditedEndedAt,
    });

    setEndedAt(nextEndedAt);
    setTimeValidationError(validateTimeRange(nextStartedAt, nextEndedAt));
  }

  function handleEndedAtChange(nextEndedAt: string) {
    setHasUserEditedEndedAt(true);
    setEndedAt(nextEndedAt);
    setTimeValidationError(validateTimeRange(startedAt, nextEndedAt));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeEpisodeId) {
      return;
    }

    const validationError = validateTimeRange(startedAt, endedAt);

    if (validationError) {
      setTimeValidationError(validationError);
      return;
    }

    const input = {
      patientId,
      episodeOfCareId: activeEpisodeId,
      startedAt,
      endedAt,
      visitStartPunctuality: visitStartPunctuality || undefined,
      clinicalNote: {
        subjective,
        objective,
        intervention,
        assessment,
        tolerance,
        homeInstructions,
        nextPlan,
      },
      tugSeconds: tugSeconds.trim() === "" ? undefined : Number(tugSeconds),
      painNrs010: painNrs010.trim() === "" ? undefined : Number(painNrs010),
      standingToleranceMinutes: standingToleranceMinutes.trim() === "" ? undefined : Number(standingToleranceMinutes),
      gaitDurationMinutes: gaitDurationMinutes.trim() === "" ? undefined : Number(gaitDurationMinutes),
    };

    startTransition(async () => {
      const result = await createEncounterAction(input);

      setMessage({
        text: result.ok ? "Visita registrada correctamente" : (result.message ?? "No se pudo registrar la visita"),
        tone: result.ok ? "success" : "error",
      });

      if (result.ok) {
        if (successRedirectPath) {
          router.push(successRedirectPath);
          return;
        }

        router.refresh();
      }
    });
  }

  if (!canCreateEncounter) {
    return (
      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-lg font-medium text-amber-900">Registrar visita realizada</h2>
        <p className="mt-2 text-sm text-amber-900">
          No se puede registrar una visita porque el paciente no tiene tratamiento activo.
        </p>
        {treatmentHref ? (
          <p className="mt-2 text-sm">
            <Link className="font-medium text-amber-900 underline-offset-2 hover:underline" href={treatmentHref}>
              Ir a gestión de tratamiento
            </Link>
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Registrar visita realizada</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <input name="episodeOfCareId" type="hidden" value={activeEpisodeId ?? ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="startedAt">
              Inicio de la visita *
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              id="startedAt"
              name="startedAt"
              onChange={(event) => handleStartedAtChange(event.target.value)}
              required
              type="datetime-local"
              value={startedAt}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="endedAt">
              Cierre de la visita *
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              id="endedAt"
              min={startedAt || undefined}
              name="endedAt"
              onChange={(event) => handleEndedAtChange(event.target.value)}
              required
              type="datetime-local"
              value={endedAt}
            />
          </div>
        </div>

        <p className="text-xs text-slate-600">Completá inicio y cierre para registrar una visita realizada.</p>
        <p className="text-xs text-slate-500">* Campos obligatorios · El resto es opcional.</p>
        <fieldset className="rounded-md border border-slate-200 bg-white p-3">
          <legend className="px-1 text-sm font-medium text-slate-900">Puntualidad operativa</legend>
          <p className="mt-1 text-xs text-slate-600">Clasificación manual orientativa; no reemplaza agenda formal.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-400 peer-has-checked:border-slate-500 peer-has-checked:bg-slate-100 peer-has-checked:text-slate-900 peer-has-focus-visible:outline peer-has-focus-visible:outline-2 peer-has-focus-visible:outline-offset-2 peer-has-focus-visible:outline-slate-500">
              <input checked={visitStartPunctuality === "on_time_or_minor_delay"} className="peer sr-only" name="visitStartPunctuality" onChange={() => setVisitStartPunctuality("on_time_or_minor_delay")} type="radio" value="on_time_or_minor_delay" />
              <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 bg-white text-[10px] font-semibold text-slate-700 peer-checked:border-slate-700 peer-checked:bg-slate-700 peer-checked:text-white">✓</span>
              <span className="font-medium">En horario</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-400 peer-has-checked:border-slate-500 peer-has-checked:bg-slate-100 peer-has-checked:text-slate-900 peer-has-focus-visible:outline peer-has-focus-visible:outline-2 peer-has-focus-visible:outline-offset-2 peer-has-focus-visible:outline-slate-500">
              <input checked={visitStartPunctuality === "delayed"} className="peer sr-only" name="visitStartPunctuality" onChange={() => setVisitStartPunctuality("delayed")} type="radio" value="delayed" />
              <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 bg-white text-[10px] font-semibold text-slate-700 peer-checked:border-slate-700 peer-checked:bg-slate-700 peer-checked:text-white">✓</span>
              <span className="font-medium">Con demora</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-400 peer-has-checked:border-slate-500 peer-has-checked:bg-slate-100 peer-has-checked:text-slate-900 peer-has-focus-visible:outline peer-has-focus-visible:outline-2 peer-has-focus-visible:outline-offset-2 peer-has-focus-visible:outline-slate-500">
              <input checked={visitStartPunctuality === "severely_delayed"} className="peer sr-only" name="visitStartPunctuality" onChange={() => setVisitStartPunctuality("severely_delayed")} type="radio" value="severely_delayed" />
              <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 bg-white text-[10px] font-semibold text-slate-700 peer-checked:border-slate-700 peer-checked:bg-slate-700 peer-checked:text-white">✓</span>
              <span className="font-medium">Muy demorada</span>
            </label>
          </div>
        </fieldset>

        <details className="rounded-md border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-slate-900">Métricas funcionales</h3>
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">Opcional</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">Cargá mediciones rápidas cuando ayuden a seguir evolución funcional o a comparar visitas del mismo ciclo.</p>
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <label className="text-sm">
              <span className="block text-slate-700">TUG (segundos)</span>
              <input className="mt-1 w-full rounded border border-slate-300 bg-white p-2" name="tugSeconds" type="number" min="0" max="300" step="0.1" value={tugSeconds} onChange={(event) => setTugSeconds(event.target.value)} />
              <span className="mt-1 block text-xs text-slate-500">Ejemplo: 12.4 s</span>
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Dolor actual (0-10)</span>
              <input className="mt-1 w-full rounded border border-slate-300 bg-white p-2" name="painNrs010" type="number" min="0" max="10" step="1" value={painNrs010} onChange={(event) => setPainNrs010(event.target.value)} />
              <span className="mt-1 block text-xs text-slate-500">Valor actual: {getPainValueLabel(painNrs010)}</span>
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Bipedestación (min)</span>
              <input className="mt-1 w-full rounded border border-slate-300 bg-white p-2" name="standingToleranceMinutes" type="number" min="0" max="240" step="0.1" value={standingToleranceMinutes} onChange={(event) => setStandingToleranceMinutes(event.target.value)} />
              <span className="mt-1 block text-xs text-slate-500">Tiempo total tolerado</span>
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Marcha</span>
              <input className="mt-1 w-full rounded border border-slate-300 bg-white p-2" name="gaitDurationMinutes" type="number" min="0" max="180" step="1" placeholder="Ej: 5" value={gaitDurationMinutes} onChange={(event) => setGaitDurationMinutes(event.target.value)} />
              <span className="mt-1 block text-xs text-slate-500">Minutos de marcha registrados en esta visita. (min)</span>
            </label>
          </div>
        </details>
        <details
          className="rounded-md border border-slate-200 bg-white p-3"
          open={isClinicalNoteExpanded}
          onToggle={(event) => setIsClinicalNoteExpanded(event.currentTarget.open)}
        >
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-slate-900">Registro clínico de la visita</h3>
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                Opcional
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Ayuda a dejar trazabilidad clínica de la sesión y mejora la reutilización futura para resúmenes, seguimiento e informes.
            </p>
          </summary>
          <div className="mt-3 space-y-3">
            <section className="rounded border border-slate-200 bg-slate-50 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Observación clínica</h4>
              <div className="mt-2 grid gap-3">
                <label className="text-sm">
                  <span className="block text-slate-700">Qué refiere el paciente o familia</span>
                  <span className="mt-1 block text-xs text-slate-500">Síntomas, cambios percibidos, dificultades o comentarios relevantes traídos a esta visita.</span>
                  <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={subjective} onChange={(event) => setSubjective(event.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="block text-slate-700">Qué se observa</span>
                  <span className="mt-1 block text-xs text-slate-500">Hallazgos observables de esta sesión: postura, movilidad, marcha, tolerancia o desempeño funcional.</span>
                  <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={objective} onChange={(event) => setObjective(event.target.value)} />
                </label>
              </div>
            </section>
            <section className="rounded border border-slate-200 bg-slate-50 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Intervención y respuesta</h4>
              <div className="mt-2 grid gap-3">
                <label className="text-sm">
                  <span className="block text-slate-700">Qué se trabajó</span>
                  <span className="mt-1 block text-xs text-slate-500">Dejá el contenido principal de la intervención. Este campo mejora mucho la utilidad del resumen compartible.</span>
                  <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={intervention} onChange={(event) => setIntervention(event.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="block text-slate-700">Respuesta o evolución de la sesión</span>
                  <span className="mt-1 block text-xs text-slate-500">Usalo para tu interpretación clínica de la visita: respuesta observada, cambios, progreso o dificultades relevantes.</span>
                  <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={assessment} onChange={(event) => setAssessment(event.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="block text-slate-700">Tolerancia</span>
                  <span className="mt-1 block text-xs text-slate-500">Describí tolerancia, fatiga, dolor, síntomas o respuesta al esfuerzo durante la sesión.</span>
                  <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={tolerance} onChange={(event) => setTolerance(event.target.value)} />
                </label>
              </div>
            </section>
            <section className="rounded border border-slate-200 bg-slate-50 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Continuidad del tratamiento</h4>
              <div className="mt-2 grid gap-3">
                <label className="text-sm">
                  <span className="block text-slate-700">Indicaciones domiciliarias</span>
                  <span className="mt-1 block text-xs text-slate-500">Qué debería continuar la persona o familia hasta la próxima visita. Este campo mejora la utilidad del resumen compartible.</span>
                  <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={homeInstructions} onChange={(event) => setHomeInstructions(event.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="block text-slate-700">Plan para próxima sesión</span>
                  <span className="mt-1 block text-xs text-slate-500">Dejá el próximo paso previsto del ciclo. También mejora la utilidad del resumen compartible.</span>
                  <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={nextPlan} onChange={(event) => setNextPlan(event.target.value)} />
                </label>
              </div>
            </section>
          </div>
        </details>

        {timeValidationError ? <p className="text-sm text-red-700">{timeValidationError}</p> : null}

        {message ? (
          <p className={`text-sm ${message.tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
            {message.text}
          </p>
        ) : null}

        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Registrar visita"}
        </button>
      </form>
    </section>
  );
}
