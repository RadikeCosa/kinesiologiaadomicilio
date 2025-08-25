import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación",
  description:
    "Servicios especializados de kinesiología y rehabilitación a domicilio: postoperatorio, adultos mayores, cuidados paliativos y terapia física personalizada en Neuquén.",
  alternates: {
    canonical: "https://kinesiologiaadomicilio.vercel.app/services",
  },
};

export default function ServicesPage() {
  const services = [
    {
      title: "Rehabilitación Post-operatoria",
      description:
        "Recuperación especializada después de cirugías ortopédicas, traumatológicas y cardíacas.",
      href: "/services/rehabilitacion-postoperatoria",
      icon: "🏥",
    },
    {
      title: "Adultos Mayores",
      description:
        "Terapia física adaptada para mantener movilidad, fuerza y autonomía en la tercera edad.",
      href: "/services/adultos-mayores",
      icon: "👴",
    },
    {
      title: "Cuidados Paliativos",
      description:
        "Acompañamiento kinesiológico para mejorar calidad de vida y confort en cuidados paliativos.",
      href: "/services/cuidados-paliativos",
      icon: "🤝",
    },
    {
      title: "Terapia Física General",
      description:
        "Sesiones de kinesiología para lesiones deportivas, dolor crónico y prevención.",
      href: "/services/terapia-fisica",
      icon: "💪",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          Servicios de kinesiología a domicilio
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Ofrecemos atención kinesiológica especializada en la comodidad de tu
          hogar. Cada sesión está diseñada según las necesidades específicas del
          paciente, con equipamiento profesional y técnicas actualizadas para
          garantizar una recuperación efectiva y segura.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8">
        {services.map((service) => (
          <div
            key={service.href}
            className="flex flex-col rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl" aria-hidden="true">
                {service.icon}
              </span>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {service.title}
              </h2>
            </div>
            <p className="mt-4 flex-auto text-base leading-7 text-slate-600 dark:text-slate-300">
              {service.description}
            </p>
            <Link
              href={service.href}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Ver detalles
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        ))}
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
          <Link
            href="https://wa.me/5492995217189?text=Hola%20quisiera%20consultar%20sobre%20los%20servicios%20de%20kinesiologia%20a%20domicilio"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          >
            <WhatsAppIcon className="mr-2 h-5 w-5" />
            Consultá por WhatsApp
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center">
        <nav aria-label="Navegación de servicios">
          <Link
            href="/"
            className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            ← Volver al inicio
          </Link>
          <span className="mx-4 text-slate-400">|</span>
          <Link
            href="/contacto"
            className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Contacto →
          </Link>
        </nav>
      </div>
    </div>
  );
}
