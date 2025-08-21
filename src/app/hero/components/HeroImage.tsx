import Image from "next/image";

export function HeroImage() {
  return (
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
  );
}
