import { formatDniDisplay } from "@/lib/patient-admin-display";

interface PatientIdentityHeaderCardProps {
  fullName: string;
  treatmentBadgeLabel: string;
  treatmentBadgeClassName: string;
  dni?: string;
  age?: number | null;
  treatmentDetail?: string | null;
}

export function PatientIdentityHeaderCard({
  fullName,
  treatmentBadgeLabel,
  treatmentBadgeClassName,
  dni,
  age = null,
  treatmentDetail = null,
}: PatientIdentityHeaderCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-900">
            {fullName}
          </h2>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${treatmentBadgeClassName}`}
          >
            {treatmentBadgeLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
          <p className="font-medium">DNI: {formatDniDisplay(dni)}</p>
          {age !== null ? (
            <p className="text-slate-600">Edad: {age} años</p>
          ) : null}
          {treatmentDetail ? (
            <p className="text-slate-600">{treatmentDetail}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
