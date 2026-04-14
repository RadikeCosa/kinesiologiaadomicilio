import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollDownButton } from "@/components/ScrollDownButton";
import { ServicesGrid } from "./components/ServicesGrid";
import { Container } from "@/components/ui/Container";
import { SECTION_Y_SPACING } from "@/components/ui/styleTokens";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { SECTION_INTRO_CONTENT } from "@/content/sectionIntroContent";

export const metadata: Metadata = {
  title: "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación",
  description:
    "Servicios especializados de kinesiología y rehabilitación a domicilio: postoperatorio, adultos mayores, cuidados paliativos y terapia física personalizada en Neuquén.",
  alternates: {
    canonical: "https://kinesiologiaadomicilio.vercel.app/services",
  },
  keywords: [
    "servicios kinesiología domicilio",
    "rehabilitación postoperatoria Neuquén",
    "kinesiología adultos mayores",
    "cuidados paliativos kinesiología",
    "terapia física domiciliaria",
  ],
};

export default function ServicesPage() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900 min-h-screen">
      <ScrollDownButton targetId="servicios-grid" />
      <Container className={`max-w-4xl ${SECTION_Y_SPACING}`}>
        <SectionIntro
          title={SECTION_INTRO_CONTENT.servicesPage.title}
          description={SECTION_INTRO_CONTENT.servicesPage.description}
          titleAs="h1"
        />

        <div id="servicios-grid">
          <ServicesGrid />
        </div>

        <div className="mt-16 text-center">
          <div className="rounded-2xl bg-sky-50 p-8 dark:bg-sky-950">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              ¿Tenés dudas sobre qué servicio necesitás?
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Contactanos por WhatsApp para una consulta personalizada sin
              compromiso.
            </p>
            <WhatsAppButton
              message="Hola quisiera consultar sobre los servicios de kinesiología a domicilio"
              ctaLocation="services"
              className="mt-6"
              variant="whatsapp"
              size="md"
            >
              Consultá por WhatsApp
            </WhatsAppButton>
          </div>
        </div>

        <div className="mt-12 text-center">
          <nav aria-label="Navegación de servicios">
            <Link
              href="/"
              className="text-sky-600 transition-colors hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:text-sky-400 dark:hover:text-sky-300"
            >
              ← Volver al inicio
            </Link>
          </nav>
        </div>
      </Container>
    </div>
  );
}
