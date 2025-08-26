import HeroSection from "./hero/hero";
import { ScrollDownButton } from "@/components/ScrollDownButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900">
      <HeroSection />
      <ScrollDownButton targetId="servicios-preview" />

      {/* Sección preview de servicios */}
      <section id="servicios-preview" className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Nuestros Servicios
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Atención kinesiológica especializada en tu hogar con equipamiento
            profesional
          </p>
          <div className="mt-10">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
