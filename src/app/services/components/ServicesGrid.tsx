import { ServiceCard } from "./ServiceCard";
import { servicesData } from "../data/servicesData";

export function ServicesGrid() {
  return (
    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8">
      {servicesData.map((service, index) => (
        <ServiceCard key={index} service={service} />
      ))}
    </div>
  );
}
