import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface PatientDetailViewProps {
  patient: PatientDetailReadModel | null;
}

const OPERATIONAL_STATUS_LABELS: Record<
  PatientDetailReadModel["operationalStatus"],
  string
> = {
  preliminary: "Identidad incompleta",
  ready_to_start: "Listo para iniciar tratamiento",
  active_treatment: "Tratamiento activo",
};

export function PatientDetailView({ patient }: PatientDetailViewProps) {
  if (!patient) {
    return (
      <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <h2 className="text-lg font-medium">Detalle de paciente</h2>
        <p className="mt-2 text-sm text-slate-700">
          No se encontró el paciente solicitado.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-medium">Detalle de paciente</h2>

      <div className="mt-4 space-y-4 text-sm text-slate-800">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Identidad</h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="font-medium">Nombre completo</dt>
              <dd>{patient.fullName}</dd>
            </div>
            <div>
              <dt className="font-medium">DNI</dt>
              <dd>{patient.dni ?? "Sin DNI"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="font-medium">Teléfono del paciente</dt>
              <dd>{patient.phone ?? "Sin teléfono"}</dd>
            </div>
            <div>
              <dt className="font-medium">Contacto principal</dt>
              <dd className="space-y-1">
                <p>Nombre: {patient.mainContact?.name ?? "No informado"}</p>
                <p>
                  Vínculo: {patient.mainContact?.relationship ?? "No informado"}
                </p>
                <p>Teléfono: {patient.mainContact?.phone ?? "No informado"}</p>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Notas generales del paciente
          </h3>
          <p className="mt-2">
            {patient.patientNotes ?? "Sin notas generales informadas."}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Estado operativo
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm">
              {OPERATIONAL_STATUS_LABELS[patient.operationalStatus]}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                patient.activeEpisode
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {patient.activeEpisode ? "En tratamiento" : "Sin tratamiento activo"}
            </span>
          </div>
        </div>
      </div>

      {patient.activeEpisode ? (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-medium">Tratamiento activo</p>
          <p>Inicio: {patient.activeEpisode.startDate}</p>
          {patient.activeEpisode.description ? (
            <p>
              Descripción breve del episodio/tratamiento:{" "}
              {patient.activeEpisode.description}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
