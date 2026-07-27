import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { Service } from "@/lib/servicesData";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200 transition-all hover:shadow-xl dark:bg-neutral-800 dark:ring-neutral-700">
      <h3 className="text-xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
        {service.title}
      </h3>
      <p className="mt-3 flex-auto text-base leading-7 text-slate-600 dark:text-slate-300">
        {service.description}
      </p>
      <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700 dark:text-slate-200">
        <section>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Cuándo suele consultarse
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {service.whenToConsult.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Qué se evalúa
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {service.evaluates.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Objetivo general
          </h4>
          <p className="mt-2">{service.goal}</p>
        </section>
      </div>
      <WhatsAppButton
        message={service.whatsappMessage}
        ctaLocation="services"
        className="mt-6 self-start"
        variant="whatsapp"
        size="sm"
        iconSize="h-4 w-4"
      >
        Consultar este caso
      </WhatsAppButton>
    </div>
  );
}
