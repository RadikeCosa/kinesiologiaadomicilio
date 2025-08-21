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
            Terapia física y rehabilitación en la comodidad y seguridad de tu
            hogar.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              href="https://wa.me/5492995217189?text=Hola%20quisiera%20consultar%20por%20una%20sesion%20de%20kinesiologia%20a%20domicilio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hacé tu consulta por WhatsApp (se abre en una nueva pestaña)"
              className="inline-flex items-center justify-center rounded-full bg-green-600 px-7 py-3 text-base font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:bg-green-600 dark:hover:bg-green-500"
            >
              <svg
                className="mr-2 h-6 w-6 fill-current"
                viewBox="0 0 32 32"
                role="img"
                aria-hidden="true"
              >
                <path d="M16.04 5.278c-5.8 0-10.523 4.707-10.523 10.493 0 1.85.487 3.65 1.415 5.238L5 27l6.2-1.63a10.5 10.5 0 0 0 4.84 1.224h.005c5.797 0 10.52-4.707 10.52-10.493 0-2.807-1.1-5.445-3.094-7.425-1.995-1.98-4.65-3.075-7.43-3.075Zm-.002 18.985a8.43 8.43 0 0 1-4.297-1.176l-.307-.183-3.68.968.985-3.59-.2-.317a8.44 8.44 0 0 1-1.29-4.49c0-4.666 3.81-8.46 8.495-8.46 2.27 0 4.404.88 6.01 2.478a8.37 8.37 0 0 1 2.49 5.982c0 4.666-3.81 8.488-8.505 8.488Zm4.64-6.32c-.25-.125-1.48-.73-1.71-.814-.23-.085-.397-.125-.565.124-.165.25-.647.814-.793.98-.147.166-.29.188-.54.063-.25-.125-1.06-.39-2.018-1.238-.745-.66-1.25-1.467-1.395-1.717-.145-.25-.016-.386.11-.51.113-.112.25-.29.373-.435.124-.146.165-.25.248-.415.083-.167.04-.313-.02-.438-.063-.125-.565-1.36-.774-1.86-.2-.48-.403-.416-.565-.425l-.48-.01c-.165 0-.435.063-.662.313-.23.25-.87.85-.87 2.075 0 1.226.892 2.41 1.017 2.577.124.166 1.756 2.68 4.25 3.76.595.257 1.06.41 1.42.525.596.19 1.14.163 1.57.1.48-.072 1.48-.602 1.69-1.186.207-.582.207-1.08.145-1.186-.063-.105-.23-.167-.48-.29Z" />
              </svg>
              <span>Hacé tu consulta</span>
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
              <span>Rehabilitación Post-Operatoria</span>
            </li>
            <li className="flex items-center gap-1">
              <span aria-hidden="true">✅</span>
              <span>Adultos mayores</span>
            </li>
            <li className="flex items-center gap-1">
              <span aria-hidden="true">✅</span>
              <span>Cuidados Paliativos</span>
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
