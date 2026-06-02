"use client";

import { useEffect } from "react";

type AdminErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function getErrorCopy(error: Error) {
  if (error.name === "AdminOperationalError") {
    return {
      title: "No se puede cargar la información clínica",
      description: error.message || "La app no pudo acceder al servidor clínico en este momento.",
    };
  }

  return {
    title: "Ocurrió un error al cargar esta vista",
    description: "No se pudo preparar la información solicitada. Probá nuevamente. Si vuelve a ocurrir, avisá al equipo técnico.",
  };
}

export default function AdminErrorBoundary({ error, reset }: AdminErrorBoundaryProps) {
  useEffect(() => {
    console.error("admin route render error", error);
  }, [error]);

  const copy = getErrorCopy(error);

  return (
    <section className="rounded-xl border border-amber-200 bg-white p-5 sm:p-6">
      <h1 className="text-xl font-semibold text-slate-900">{copy.title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-700">{copy.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={() => reset()}
          type="button"
        >
          Reintentar
        </button>
      </div>
      {process.env.NODE_ENV !== "production" ? (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
          Detalle técnico: {error.name}
          {error.message ? ` · ${error.message}` : ""}
        </p>
      ) : null}
    </section>
  );
}
