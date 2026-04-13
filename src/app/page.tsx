import HeroSection from "./hero/hero";
import { ScrollDownButton } from "@/components/ScrollDownButton";
import Link from "next/link";
import { getCtaClass } from "@/components/ui/ctaStyles";
import { Container } from "@/components/ui/Container";
import { SECTION_Y_SPACING } from "@/components/ui/styleTokens";
import { SectionIntro } from "@/components/ui/SectionIntro";

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900">
      <HeroSection />
      <ScrollDownButton targetId="servicios-preview" />

      {/* Sección preview de servicios */}
      <section id="servicios-preview" className={SECTION_Y_SPACING}>
        <Container className="max-w-4xl text-center">
          <SectionIntro
            title="Nuestros Servicios"
            description="Atención kinesiológica especializada en tu hogar con equipamiento profesional"
            titleAs="h2"
          />
          <div className="mt-8">
            <Link
              href="/services"
              className={getCtaClass({ variant: "sky", size: "md" })}
            >
              Ver todos los servicios
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
