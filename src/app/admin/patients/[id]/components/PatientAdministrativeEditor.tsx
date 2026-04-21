"use client";

import { useRouter } from "next/navigation";

import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { PatientEditForm } from "@/app/admin/patients/[id]/components/PatientEditForm";

interface PatientAdministrativeEditorProps {
  patient: PatientDetailReadModel;
}

export function PatientAdministrativeEditor({
  patient,
}: PatientAdministrativeEditorProps) {
  const router = useRouter();

  return (
    <PatientEditForm
      isEditing
      onEditingChange={(nextValue) => {
        if (!nextValue) {
          router.push(`/admin/patients/${patient.id}`);
        }
      }}
      patient={patient}
    />
  );
}
