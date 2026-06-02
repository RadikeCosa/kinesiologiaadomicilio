"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useFormFeedback } from "@/app/admin/hooks/useFormFeedback";
import { upsertSigningProfessionalAction } from "@/app/admin/configuracion/profesional/actions";
import type { SigningProfessionalConfig } from "@/domain/signing-professional/signing-professional.types";

interface SigningProfessionalSettingsPanelProps {
  initialConfig: SigningProfessionalConfig;
}

const STATUS_PRESENTATION: Record<SigningProfessionalConfig["status"], { label: string; className: string; description: string }> = {
  missing: {
    label: "Sin configurar",
    className: "border-amber-300 bg-amber-50 text-amber-900",
    description: "Todavía no hay profesional firmante configurado.",
  },
  incomplete: {
    label: "Incompleto",
    className: "border-amber-300 bg-amber-50 text-amber-900",
    description: "La configuración existe, pero falta información necesaria para firmar.",
  },
  ready: {
    label: "Listo para firmar",
    className: "border-emerald-300 bg-emerald-50 text-emerald-900",
    description: "Estos datos podrán usarse en reportes o documentos revisados cuando esa función exista.",
  },
};

function getDisplayValue(value: string | undefined): string {
  return value?.trim() || "No informado";
}

function buildInitialEditing(config: SigningProfessionalConfig): boolean {
  return config.status === "missing";
}

export function SigningProfessionalSettingsPanel({ initialConfig }: SigningProfessionalSettingsPanelProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(buildInitialEditing(initialConfig));
  const [isPending, startTransition] = useTransition();
  const { message, setMessage, clearMessage } = useFormFeedback();
  const presentation = STATUS_PRESENTATION[initialConfig.status];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const input = {
      fullName: String(formData.get("fullName") ?? ""),
      roleTitle: String(formData.get("roleTitle") ?? ""),
      licenseNumber: String(formData.get("licenseNumber") ?? "") || undefined,
      licenseJurisdiction: String(formData.get("licenseJurisdiction") ?? "") || undefined,
      signatureDisplay: String(formData.get("signatureDisplay") ?? "") || undefined,
      professionalPhone: String(formData.get("professionalPhone") ?? "") || undefined,
    };

    startTransition(async () => {
      const result = await upsertSigningProfessionalAction(input);

      setMessage({
        text: result.message ?? (result.ok ? "Profesional firmante guardado correctamente." : "No se pudo guardar la configuración."),
        tone: result.ok ? "success" : "error",
      });

      if (result.ok) {
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  if (isEditing) {
    return (
      <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-slate-900">Datos del profesional</h2>
            <p className="mt-1 text-sm text-slate-600">
              Completá los datos que se usarán más adelante para firmar reportes o documentos clínicos revisados.
            </p>
          </div>
          {initialConfig.status !== "missing" ? (
            <button
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              disabled={isPending}
              onClick={() => {
                setIsEditing(false);
                clearMessage();
              }}
              type="button"
            >
              Cancelar edición
            </button>
          ) : null}
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-900" htmlFor="fullName">
              Nombre completo *
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={initialConfig.fullName ?? ""}
              id="fullName"
              name="fullName"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900" htmlFor="roleTitle">
              Título o rol visible *
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={initialConfig.roleTitle ?? ""}
              id="roleTitle"
              name="roleTitle"
              placeholder="Ej: Lic. en Kinesiología"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-900" htmlFor="licenseNumber">
                Matrícula profesional
              </label>
              <input
                className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
                defaultValue={initialConfig.licenseNumber ?? ""}
                id="licenseNumber"
                name="licenseNumber"
              />
              <p className="mt-1 text-xs text-slate-600">Necesaria para considerar la configuración lista para firmar.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900" htmlFor="licenseJurisdiction">
                Jurisdicción o colegio
              </label>
              <input
                className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
                defaultValue={initialConfig.licenseJurisdiction ?? ""}
                id="licenseJurisdiction"
                name="licenseJurisdiction"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900" htmlFor="signatureDisplay">
              Texto de firma
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={initialConfig.signatureDisplay ?? ""}
              id="signatureDisplay"
              name="signatureDisplay"
              placeholder="Ej: Lic. Nombre Apellido - MP 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900" htmlFor="professionalPhone">
              Teléfono profesional
            </label>
            <input
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2"
              defaultValue={initialConfig.professionalPhone ?? ""}
              id="professionalPhone"
              inputMode="tel"
              name="professionalPhone"
              type="tel"
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
            {isPending ? "Guardando..." : "Guardar profesional firmante"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-medium text-slate-900">Profesional firmante</h2>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${presentation.className}`}>
              {presentation.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{presentation.description}</p>
        </div>
        <button
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={() => {
            setIsEditing(true);
            clearMessage();
          }}
          type="button"
        >
          Editar datos
        </button>
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-slate-800 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Nombre completo</dt>
          <dd className="mt-1">{getDisplayValue(initialConfig.fullName)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Título o rol</dt>
          <dd className="mt-1">{getDisplayValue(initialConfig.roleTitle)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Matrícula</dt>
          <dd className="mt-1">{getDisplayValue(initialConfig.licenseNumber)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Jurisdicción / colegio</dt>
          <dd className="mt-1">{getDisplayValue(initialConfig.licenseJurisdiction)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Texto de firma</dt>
          <dd className="mt-1">{getDisplayValue(initialConfig.signatureDisplay)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Teléfono profesional</dt>
          <dd className="mt-1">{getDisplayValue(initialConfig.professionalPhone)}</dd>
        </div>
      </dl>
    </section>
  );
}
