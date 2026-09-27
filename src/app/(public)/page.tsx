import HeroSection from "@/app/hero/hero";
import { AboutSection } from "@/app/home/components/AboutSection";
import { ServiceContextBanner } from "@/app/home/components/ServiceContextBanner";
import { HowItWorksSection } from "@/app/home/components/HowItWorksSection";
import { ServicesPreviewSection } from "@/app/home/components/ServicesPreviewSection";
import Link from "next/link";
import { getCtaClass } from "@/components/ui/ctaStyles";
import { Container } from "@/components/ui/Container";

export default function Home() {
  return (
    <div className="bg-[#f5f8f7] dark:bg-neutral-950">
      <HeroSection />
      <ServiceContextBanner />
      <AboutSection />
      <ServicesPreviewSection />

      <section aria-labelledby="evaluation-link-heading" className="pb-12 sm:pb-16">
        <Container className="max-w-6xl">
          <div className="flex flex-col gap-5 rounded-[1.75rem] bg-[#163b4b] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div>
              <h2 id="evaluation-link-heading" className="text-2xl font-semibold">¿No sabés si la atención a domicilio es adecuada?</h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-100">Usá esta orientación inicial para conocer opciones antes de escribir.</p>
            </div>
            <Link href="/evaluar" className={getCtaClass({ variant: "secondary", size: "md", className: "shrink-0 border-white bg-white text-slate-900 hover:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100" })}>
              ¿Me puede ayudar un kinesiólogo?
            </Link>
          </div>
        </Container>
      </section>

      <HowItWorksSection />
    </div>
  );
}
