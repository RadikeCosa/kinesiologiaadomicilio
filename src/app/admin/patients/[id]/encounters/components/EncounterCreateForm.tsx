"use client";

import { FormEvent, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { createEncounterAction } from "@/app/admin/patients/[id]/encounters/actions/create-encounter.action";

interface EncounterCreateFormProps {
  patientId: string;
  activeEpisodeId: string | null;
  treatmentHref?: string;
  successRedirectPath?: string;
}

function getNowDateTimeLocal(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
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

  const canCreateEncounter = Boolean(activeEpisodeId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeEpisodeId) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const input = {
      patientId,
      episodeOfCareId: activeEpisodeId,
      startedAt: String(formData.get("startedAt") ?? ""),
      endedAt: String(formData.get("endedAt") ?? "") || undefined,
    };

    startTransition(async () => {
      const result = await createEncounterAction(input);

      setMessage({
        text: result.ok ? "Visita registrada correctamente" : "No se pudo registrar la visita",
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

        <div>
          <label className="block text-sm font-medium" htmlFor="startedAt">
            Inicio de la visita *
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            defaultValue={getNowDateTimeLocal()}
            id="startedAt"
            name="startedAt"
            required
            type="datetime-local"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="endedAt">
            Finalización de la visita (opcional)
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
            id="endedAt"
            name="endedAt"
            type="datetime-local"
          />
        </div>

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
