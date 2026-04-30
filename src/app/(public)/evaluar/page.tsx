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
  openGraph: {
    title: "¿Me puede ayudar un kinesiólogo a domicilio? | Kinesiología Neuquén",
    description:
      "Orientación inicial para saber si la atención kinesiológica a domicilio puede encajar en distintos casos en Neuquén, sin reemplazar una evaluación profesional ni un diagnóstico.",
    url: `${BUSINESS_CONFIG.url}/evaluar`,
    siteName: "Rehabilitación a domicilio Neuquén",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-placeholder.png",
        width: 1200,
        height: 630,
        alt: "¿Me puede ayudar un kinesiólogo a domicilio?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Me puede ayudar un kinesiólogo a domicilio? | Kinesiología Neuquén",
    description:
      "Orientación inicial para saber si la atención kinesiológica a domicilio puede encajar en distintos casos en Neuquén, sin reemplazar una evaluación profesional ni un diagnóstico.",
    images: ["/og-placeholder.png"],
  },
};

export default function EvaluarPage() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900 min-h-screen">
      <EvaluarFlow content={EVALUAR_CONTENT} />
    </div>
  );
}
