import HeroSection from "./hero/hero";
import { AboutSection } from "@/app/home/components/AboutSection";
import { ServiceContextBanner } from "@/app/home/components/ServiceContextBanner";
import { HowItWorksSection } from "@/app/home/components/HowItWorksSection";
import Link from "next/link";
import { getCtaClass } from "@/components/ui/ctaStyles";
import { Container } from "@/components/ui/Container";
import {
  SECTION_LEAD_CLASS,
  SECTION_TITLE_CLASS,
  SECTION_Y_SPACING,
} from "@/components/ui/styleTokens";
import { HOME_CONTENT } from "@/app/home/homeContent";

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900">
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <ServiceContextBanner />

      {/* Sección preview de servicios */}
      <section id="servicios-preview" className={SECTION_Y_SPACING}>
        <Container className="max-w-4xl text-center">
          <header>
            <h2 className={SECTION_TITLE_CLASS}>
              {HOME_CONTENT.servicesPreviewIntro.title}
            </h2>
            <p className={SECTION_LEAD_CLASS}>
              {HOME_CONTENT.servicesPreviewIntro.description}
            </p>
          </header>
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
