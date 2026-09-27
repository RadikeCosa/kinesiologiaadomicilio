type CtaVariant = "sky" | "whatsapp" | "secondary";
type CtaSize = "sm" | "md";

const CTA_BASE =
  "inline-flex min-h-11 items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const CTA_VARIANTS: Record<CtaVariant, string> = {
  sky: "bg-sky-800 text-white hover:bg-sky-900 focus-visible:ring-sky-500",
  whatsapp:
    "bg-green-800 text-white hover:bg-green-900 focus-visible:ring-green-600",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-sky-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-neutral-800",
};

const CTA_SIZES: Record<CtaSize, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-8 py-3.5 text-base",
};

export interface CtaClassOptions {
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
}

export function getCtaClass({
  variant = "sky",
  size = "md",
  className,
}: CtaClassOptions = {}) {
  return [CTA_BASE, CTA_VARIANTS[variant], CTA_SIZES[size], className]
    .filter(Boolean)
    .join(" ");
}
