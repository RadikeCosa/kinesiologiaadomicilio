import HeroSection from "./hero/hero";
import { AboutSection } from "@/app/home/components/AboutSection";
import { ServiceContextBanner } from "@/app/home/components/ServiceContextBanner";
import Link from "next/link";
import { getCtaClass } from "@/components/ui/ctaStyles";
import { Container } from "@/components/ui/Container";
import { SECTION_Y_SPACING } from "@/components/ui/styleTokens";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { SECTION_INTRO_CONTENT } from "@/content/sectionIntroContent";

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900">
      <HeroSection />
      <AboutSection />
      <ServiceContextBanner />

      {/* Sección preview de servicios */}
      <section id="servicios-preview" className={SECTION_Y_SPACING}>
        <Container className="max-w-4xl text-center">
          <SectionIntro
            title={SECTION_INTRO_CONTENT.homeServicesPreview.title}
            description={SECTION_INTRO_CONTENT.homeServicesPreview.description}
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
