import Image from "next/image";

export function HeroImage() {
  return (
    <div className="mt-4 w-full max-w-xs sm:mt-0 sm:max-w-[22.5rem]">
      {/* ~20% menos que 28rem (md) */}
      <Image
        src="/hero-image.png"
        alt="Sesión de kinesiología a domicilio en Neuquén Capital"
        width={300}
        height={450}
        priority
        fetchPriority="high"
        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 38vw, 360px"
        className="h-auto w-full rounded-xl object-cover"
      />
    </div>
  );
}
