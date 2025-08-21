interface HeroServiceTypesListProps {
  align?: "auto" | "left"; // auto centra bajo los botones; left lo alinea al contenedor
}

export function HeroServiceTypesList({
  align = "auto",
}: HeroServiceTypesListProps) {
  // Etiquetas acortadas para mantener una sola línea y alinear los íconos en una grilla 2x2
  const items: { label: string; full?: string }[] = [
    { label: "Rehab post-operatoria", full: "Rehabilitación Post-Operatoria" },
    { label: "Adultos mayores" },
    { label: "Cuidados Paliativos", full: "Cuidados Paliativos" },
    { label: "A domicilio" },
  ];
  return (
    <ul
      aria-label="Tipos de servicios de kinesiología a domicilio"
      className={`mt-6 inline-grid grid-cols-2 justify-items-start gap-x-6 gap-y-3 text-[13px] text-slate-600 dark:text-slate-400 sm:mt-8 sm:gap-x-8 sm:text-sm ${
        align === "auto" ? "mx-auto w-fit" : ""
      }`}
    >
      {items.map(({ label, full }) => (
        <li key={label} className="flex items-start gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="flex h-4 w-4 items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-emerald-500"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="leading-snug" {...(full ? { title: full } : {})}>
            {label}
            {full && <span className="sr-only"> ({full})</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
