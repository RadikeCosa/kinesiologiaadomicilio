import Image from "next/image";

export function HeroImage() {
  return (
    <div className="mt-4 w-full max-w-md shrink-0 sm:mt-0">
      <Image
        src="/hero-session.png"
        alt="Ramiro guía a un paciente en un ejercicio de movilidad durante una sesión de kinesiología a domicilio"
        width={1536}
        height={1024}
        priority
        fetchPriority="high"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 42vw, 448px"
        className="aspect-[3/2] h-auto w-full rounded-2xl object-cover"
      />
    </div>
  );
}
