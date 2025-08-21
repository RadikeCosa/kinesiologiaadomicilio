import { HeroWhatsAppButton } from "./components/HeroWhatsAppButton";
import { HeroSecondaryLink } from "./components/HeroSecondaryLink";
import { HeroServiceTypesList } from "./components/HeroServiceTypesList";
import { HeroImage } from "./components/HeroImage";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="flex flex-1 items-center bg-slate-50 px-4 py-10 sm:py-12 dark:bg-neutral-900"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 sm:flex-row md:gap-12">
        <div className="w-full max-w-2xl text-center sm:text-left">
          <h1
            id="hero-heading"
            className="text-balance text-3xl font-bold leading-snug sm:text-5xl md:text-6xl"
          >
            Kinesiología y Rehabilitación{" "}
            <span className="text-sky-600 dark:text-sky-400">a domicilio</span>{" "}
            en Neuquén
          </h1>
          <p className="sr-only">
            Atención de kinesiología y rehabilitación domiciliaria en Neuquén:
            Adultos mayores, post operatorios, cuidados paliativos.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:mt-6 sm:text-xl">
            Terapia física y rehabilitación en la comodidad de tu hogar.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <HeroWhatsAppButton />
            <HeroSecondaryLink />
          </div>
          <HeroServiceTypesList />
        </div>
        <HeroImage />
      </div>
    </section>
  );
}
