import Image from "next/image";

export function HeroImage() {
  return (
    <figure className="relative mx-auto w-full max-w-[28rem]">
      <div className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-[#c6dcd7] dark:bg-neutral-700" />
      <Image
        src="/ramiro-profile.png"
        alt="Ramiro Cosa, kinesiólogo en Neuquén Capital"
        width={1536}
        height={1024}
        priority
        fetchPriority="high"
        sizes="(max-width: 768px) 88vw, 440px"
        className="relative aspect-[4/4.2] w-full rounded-[1.75rem] object-cover object-[62%_center] shadow-xl"
      />
      <figcaption className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md dark:border-neutral-600 dark:bg-neutral-900 dark:text-white">
        Ramiro Cosa · Kinesiólogo
      </figcaption>
    </figure>
  );
}
