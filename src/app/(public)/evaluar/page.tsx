import type { Metadata } from "next";
import { EvaluarFlow } from "./components/EvaluarFlow";
import { EVALUAR_CONTENT } from "./evaluar-content";
import { BUSINESS_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "¿Me puede ayudar un kinesiólogo a domicilio? | Kinesiología Neuquén",
  description:
    "Orientación inicial para saber si la atención kinesiológica a domicilio puede encajar en distintos casos en Neuquén, sin reemplazar una evaluación profesional ni un diagnóstico.",
  alternates: {
    canonical: `${BUSINESS_CONFIG.url}/evaluar`,
  },
};

export default function EvaluarPage() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900 min-h-screen">
      <EvaluarFlow content={EVALUAR_CONTENT} />
    </div>
  );
}
