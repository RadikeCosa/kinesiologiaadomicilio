import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="bg-slate-50 px-4 py-12 sm:py-16 dark:bg-neutral-900"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row md:gap-12">
        {/* Texto principal (primero en DOM y mobile) */}
        <div className="w-full max-w-2xl text-center sm:text-left">
          <h1
            id="hero-heading"
            className="text-balance text-3xl font-bold leading-snug sm:text-5xl md:text-6xl"
          >
            Kinesiología y rehabilitación{" "}
            <span className="text-sky-600 dark:text-sky-400">a domicilio</span>{" "}
            en Neuquén Capital
          </h1>
          <p className="sr-only">
            Atención de kinesiología y rehabilitación domiciliaria en Neuquén:
            sesiones personalizadas, adultos mayores, post operatorios y
            recuperación funcional.
          </p>
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
              href="https://wa.me/5492995217189?text=Hola%20quisiera%20consultar%20por%20una%20sesion%20de%20kinesiologia%20a%20domicilio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir conversación de WhatsApp en una nueva pestaña"
              className="inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:bg-green-600 dark:hover:bg-green-500"
            >
              WhatsApp directo
              <span className="ml-2">↗</span>
            </Link>
            <Link
              href="#servicios"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-neutral-800"
            >
              Ver servicios
            </Link>
          </div>

          <ul
            aria-label="Beneficios de la atención"
            className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-slate-600 dark:text-slate-400 sm:mt-8 sm:justify-start sm:gap-x-6 sm:text-sm"
          >
            <li className="flex items-center gap-1">
              <span aria-hidden="true">✅</span>
              <span>Sesiones personalizadas</span>
            </li>
            <li className="flex items-center gap-1">
              <span aria-hidden="true">✅</span>
              <span>Adultos mayores</span>
            </li>
            <li className="flex items-center gap-1">
              <span aria-hidden="true">✅</span>
              <span>Post-operatorio</span>
            </li>
            <li className="flex items-center gap-1">
              <span aria-hidden="true">✅</span>
              <span>A domicilio</span>
            </li>
          </ul>
        </div>
        {/* Imagen (visible debajo del texto en mobile, lateral en desktop) */}
        <div className="mt-4 w-full max-w-xs sm:mt-0 sm:max-w-md">
          <Image
            src="/hero-image.png"
            alt="Sesión de kinesiología a domicilio en Neuquén Capital"
            width={400}
            height={600}
            priority
            fetchPriority="high"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 400px"
            className="h-auto w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
