import type { Metadata } from "next";
import { EvaluarFlow } from "./components/EvaluarFlow";
import { EVALUAR_CONTENT } from "./evaluar-content";
import { BUSINESS_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Evaluar kinesiología a domicilio en Neuquén | ¿Cuándo consultar?",
  description:
    "Orientación inicial para saber cuándo consultar por kinesiología a domicilio en Neuquén, con foco en rehabilitación funcional y atención particular en domicilio.",
  alternates: {
    canonical: `${BUSINESS_CONFIG.url}/evaluar`,
  },
  openGraph: {
    title: "Evaluar kinesiología a domicilio en Neuquén | ¿Cuándo consultar?",
    description:
      "Orientación inicial para saber cuándo consultar por kinesiología a domicilio en Neuquén, con foco en rehabilitación funcional y atención particular en domicilio.",
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
    title: "Evaluar kinesiología a domicilio en Neuquén | ¿Cuándo consultar?",
    description:
      "Orientación inicial para saber cuándo consultar por kinesiología a domicilio en Neuquén, con foco en rehabilitación funcional y atención particular en domicilio.",
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
