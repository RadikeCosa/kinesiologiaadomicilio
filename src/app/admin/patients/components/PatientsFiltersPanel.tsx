import Link from "next/link";

export interface PatientsFiltersPanelOption<TFilter extends string> {
  value: TFilter;
  label: string;
}

interface PatientsFiltersPanelProps<TFilter extends string> {
  activeFilter: TFilter;
  filters: PatientsFiltersPanelOption<TFilter>[];
  buildHref: (status?: TFilter) => string;
}

export function PatientsFiltersPanel<TFilter extends string>({
  activeFilter,
  filters,
  buildHref,
}: PatientsFiltersPanelProps<TFilter>) {
  const isFilterActive = (value: TFilter): boolean => {
    if (activeFilter === "pending" && value !== "pending") {
      return value === "preliminary" || value === "ready_to_start";
    }

    return value === activeFilter;
  };

  return (
    <nav aria-label="Filtrar pacientes por estado" className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Estado operativo
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = isFilterActive(filter.value);

          return (
            <Link
              key={filter.value}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              href={buildHref(filter.value)}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
