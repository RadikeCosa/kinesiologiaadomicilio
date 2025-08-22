import HeroSection from "./hero/hero";

export default function Home() {
  return (
    <div className="items-center ">
      <HeroSection />
      {/* Placeholder Sección Servicios para que el anchor funcione y pueda expandirse */}
      <section
        id="servicios"
        aria-labelledby="servicios-heading"
        className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24"
      >
        <div className="max-w-2xl">
          <h2
            id="servicios-heading"
            className="text-balance text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl"
          >
            Servicios de kinesiología a domicilio
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Próximamente vas a encontrar el detalle de los planes de
            rehabilitación, tipos de sesiones y condiciones tratadas
            (post-operatorio, cuidados paliativos, adultos mayores). Mientras
            tanto podés realizar tu consulta directa por WhatsApp.
          </p>
        </div>
      </section>
    </div>
  );
}
