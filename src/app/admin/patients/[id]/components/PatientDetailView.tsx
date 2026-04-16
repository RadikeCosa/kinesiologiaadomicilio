import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface PatientDetailViewProps {
  patient: PatientDetailReadModel | null;
}

function resolveOperationalSignal(patient: PatientDetailReadModel): string {
  if (patient.activeEpisode) {
    return "Tratamiento activo";
  }

  if (patient.dni) {
    return "Listo para iniciar tratamiento";
  }

  return "Identidad incompleta";
}

export function PatientDetailView({ patient }: PatientDetailViewProps) {
  if (!patient) {
    return (
      <section className="mt-6 rounded border border-dashed border-gray-300 p-4">
        <h2 className="text-lg font-medium">Detalle de paciente</h2>
        <p className="mt-2 text-sm text-gray-700">No se encontró el paciente solicitado.</p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded border border-gray-200 p-4">
      <h2 className="text-lg font-medium">Detalle de paciente</h2>

      <dl className="mt-3 space-y-2 text-sm text-gray-800">
        <div>
          <dt className="font-medium">Nombre completo</dt>
          <dd>{patient.fullName}</dd>
        </div>
        <div>
          <dt className="font-medium">DNI</dt>
          <dd>{patient.dni ?? "Sin DNI"}</dd>
        </div>
        {patient.phone ? (
          <div>
            <dt className="font-medium">Teléfono</dt>
            <dd>{patient.phone}</dd>
          </div>
        ) : null}
        {patient.patientNotes ? (
          <div>
            <dt className="font-medium">Notas</dt>
            <dd>{patient.patientNotes}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium">Estado operativo</dt>
          <dd>{resolveOperationalSignal(patient)}</dd>
        </div>
      </dl>

      {patient.activeEpisode ? (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-medium">Tratamiento activo</p>
          <p>Inicio: {patient.activeEpisode.startDate}</p>
          {patient.activeEpisode.description ? <p>Descripción: {patient.activeEpisode.description}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
