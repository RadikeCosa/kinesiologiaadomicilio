export function HeroBenefitsList() {
  const items = [
    "Rehabilitación Post-Operatoria",
    "Adultos mayores",
    "Cuidados Paliativos",
    "A domicilio",
  ];
  return (
    <ul
      aria-label="Beneficios de la atención"
      className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-slate-600 dark:text-slate-400 sm:mt-8 sm:justify-start sm:gap-x-6 sm:text-sm"
    >
      {items.map((label) => (
        <li key={label} className="flex items-center gap-1">
          <span aria-hidden="true">✅</span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
