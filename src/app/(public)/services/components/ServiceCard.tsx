import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { Service } from "@/lib/servicesData";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const consultationLabel = `Consultar por ${service.title}`;

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg sm:p-7 dark:border-neutral-700 dark:bg-neutral-800">
      <h3 className="text-xl font-semibold leading-snug tracking-tight text-slate-950 dark:text-white">
        {service.title}
      </h3>
      <p className="mt-3 flex-auto text-base leading-7 text-slate-700 dark:text-slate-300">
        {service.description}
      </p>
      <div className="mt-6 space-y-5 text-base leading-7 text-slate-700 dark:text-slate-200">
        <section>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Cuándo suele consultarse
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {service.whenToConsult.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Qué se evalúa
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {service.evaluates.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Objetivo general
          </h4>
          <p className="mt-2">{service.goal}</p>
        </section>
      </div>
      <WhatsAppButton
        message={service.whatsappMessage}
        ctaLocation="services"
        ctaLabel={`${consultationLabel} por WhatsApp`}
        className="mt-7 self-start"
        variant="whatsapp"
        size="sm"
        iconSize="h-4 w-4"
      >
        {consultationLabel}
      </WhatsAppButton>
    </article>
  );
}
