import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ServicesGrid } from "./components/ServicesGrid";

export const metadata: Metadata = {
  title: "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación",
  description:
    "Servicios especializados de kinesiología y rehabilitación a domicilio: postoperatorio, adultos mayores, cuidados paliativos y terapia física personalizada en Neuquén.",
  alternates: {
    canonical: "https://kinesiologiaadomicilio.vercel.app/services",
  },
};

export default function ServicesPage() {
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

      <ServicesGrid />

      <div className="mt-16 text-center">
        <div className="rounded-2xl bg-sky-50 p-8 dark:bg-sky-950">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            ¿Tenés dudas sobre qué servicio necesitás?
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Contactanos por WhatsApp para una consulta personalizada sin
            compromiso.
          </p>
          <WhatsAppButton
            message="Hola quisiera consultar sobre los servicios de kinesiología a domicilio"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          >
            Consultá por WhatsApp
          </WhatsAppButton>
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
