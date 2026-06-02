import type { Metadata } from "next";
import Link from "next/link";

import { SigningProfessionalSettingsPanel } from "@/app/admin/configuracion/profesional/components/SigningProfessionalSettingsPanel";
import { loadSigningProfessionalConfig } from "@/features/signing-professional/read-models/signing-professional-config.read-model";

export const metadata: Metadata = {
  title: "Profesional firmante",
};

export default async function AdminSigningProfessionalPage() {
  const config = await loadSigningProfessionalConfig();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <Link className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline" href="/admin/">
        ← Volver al panel
      </Link>

      <div className="mt-3">
        <h1 className="text-2xl font-semibold text-slate-900">Configuración · Profesional firmante</h1>
        <p className="mt-2 text-sm text-slate-600">
          Datos profesionales que podrán usarse más adelante en reportes o documentos clínicos revisados.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Esta pantalla no genera reportes ni firma documentos todavía.
        </p>
      </div>

      <SigningProfessionalSettingsPanel initialConfig={config} />
    </section>
  );
}
