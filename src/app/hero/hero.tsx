import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-slate-50 px-4 pb-16 pt-20 dark:bg-neutral-900"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:pb-12 md:gap-12">
        {/* Texto principal (primero en DOM y mobile) */}
        <div className="w-full max-w-2xl text-center sm:text-left">
          <h1
            id="hero-heading"
            className="text-balance text-3xl font-bold leading-snug sm:text-5xl md:text-6xl"
          >
            <span className="block">Kinesiología y</span>
            <span className="text-sky-600 dark:text-sky-400">
              Rehabilitación a Domicilio
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:mt-6 sm:text-xl">
            Atención profesional personalizada en{" "}
            <strong>Neuquén Capital</strong>. Sesiones de
            <span className="font-medium">
              {" "}
              kinesiología y rehabilitacion
            </span>{" "}
            en la comodidad y seguridad de tu hogar.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              href="#contacto"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Solicitar turno
              <span className="ml-2">→</span>
            </Link>
            <Link
              href="#servicios"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-neutral-800"
            >
              Ver servicios
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-slate-600 dark:text-slate-400 sm:mt-8 sm:justify-start sm:gap-x-6 sm:text-sm">
            <li className="flex items-center gap-1">
              ✅ Sesiones personalizadas
            </li>
            <li className="flex items-center gap-1">✅ Adultos mayores</li>
            <li className="flex items-center gap-1">✅ Post-operatorio</li>
            <li className="flex items-center gap-1">✅ A domicilio</li>
          </ul>
        </div>
        {/* Imagen (visible debajo del texto en mobile, lateral en desktop) */}
        <div className="mt-4 w-full max-w-xs sm:mt-0 sm:max-w-md">
          <Image
            src="/hero-image.png"
            alt="Profesional de kinesiología realizando una sesión a domicilio"
            width={400}
            height={600}
            priority
            className="h-auto w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
