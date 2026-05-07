"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { createEncounterAction } from "@/app/admin/patients/[id]/encounters/actions/create-encounter.action";
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
      clinicalNote: {
        subjective,
        objective,
        intervention,
        assessment,
        tolerance,
        homeInstructions,
        nextPlan,
      },
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
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-medium text-slate-900">Registro clínico de la visita</h3>
          <p className="mt-1 text-xs text-slate-600">
            Opcional. Ayuda a dejar trazabilidad clínica de la sesión y preparar futuros informes.
          </p>
          <div className="mt-3 grid gap-3">
            <label className="text-sm">
              <span className="block text-slate-700">Qué refiere el paciente o familia</span>
              <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={subjective} onChange={(event) => setSubjective(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Qué se observa</span>
              <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={objective} onChange={(event) => setObjective(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Qué se trabajó</span>
              <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={intervention} onChange={(event) => setIntervention(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Respuesta o evolución de la sesión</span>
              <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={assessment} onChange={(event) => setAssessment(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Tolerancia</span>
              <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={tolerance} onChange={(event) => setTolerance(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Indicaciones domiciliarias</span>
              <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={homeInstructions} onChange={(event) => setHomeInstructions(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700">Plan para próxima sesión</span>
              <textarea className="mt-1 w-full rounded border border-slate-300 p-2" rows={2} value={nextPlan} onChange={(event) => setNextPlan(event.target.value)} />
            </label>
          </div>
        </div>

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
