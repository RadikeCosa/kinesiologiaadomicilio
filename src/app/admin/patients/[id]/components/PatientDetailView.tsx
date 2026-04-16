import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

interface PatientDetailViewProps {
  patient: PatientDetailReadModel | null;
}

export function PatientDetailView({ patient }: PatientDetailViewProps) {
  if (!patient) {
    return (
      <section className="mt-6 rounded border border-dashed border-gray-300 p-4">
        <h2 className="text-lg font-medium">Detalle de paciente</h2>
        <p className="mt-2 text-sm text-gray-700">
          Placeholder operativo: no hay detalle cargado en esta fase.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded border border-gray-200 p-4">
      <h2 className="text-lg font-medium">Detalle de paciente</h2>
      <p className="mt-2 text-sm text-gray-700">{patient.fullName}</p>
    </section>
  );
}
