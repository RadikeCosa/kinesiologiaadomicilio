type CtaVariant = "sky" | "whatsapp" | "secondary";
type CtaSize = "sm" | "md";

const CTA_BASE =
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const CTA_VARIANTS: Record<CtaVariant, string> = {
  sky: "bg-sky-600 text-white hover:bg-sky-500 focus-visible:ring-sky-400",
  whatsapp:
    "bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-400",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-sky-400 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-neutral-800",
};

const CTA_SIZES: Record<CtaSize, string> = {
  sm: "px-5 py-2 text-sm",
  md: "px-8 py-3 text-base",
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
