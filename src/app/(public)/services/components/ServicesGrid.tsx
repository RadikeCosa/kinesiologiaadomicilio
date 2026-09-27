import { ServiceCard } from "./ServiceCard";
import { servicesData } from "@/lib/servicesData";

export function ServicesGrid() {
  return (
    <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-5 sm:mt-10 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-6">
      {servicesData.map((service) => (
        <ServiceCard key={service.title} service={service} />
      ))}
    </div>
  );
}
