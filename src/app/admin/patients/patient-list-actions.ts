import type { PatientOperationalStatus } from "@/domain/patient/patient.types";

export interface PatientListAction {
  href: string;
  label: string;
  kind: "primary" | "secondary";
}

export function getPatientListActions(input: {
  patientId: string;
  operationalStatus: PatientOperationalStatus;
}): PatientListAction[] {
  const { patientId, operationalStatus } = input;

  if (operationalStatus === "active_treatment") {
    return [
      {
        href: `/admin/patients/${patientId}/encounters/new`,
        label: "Registrar visita",
        kind: "primary",
      },
      {
        href: `/admin/patients/${patientId}/encounters`,
        label: "Clínica",
        kind: "secondary",
      },
      {
        href: `/admin/patients/${patientId}/treatment`,
        label: "Tratamiento",
        kind: "secondary",
      },
    ];
  }

  if (operationalStatus === "ready_to_start") {
    return [
      {
        href: `/admin/patients/${patientId}/treatment`,
        label: "Tratamiento",
        kind: "primary",
      },
      {
        href: `/admin/patients/${patientId}/encounters`,
        label: "Clínica",
        kind: "secondary",
      },
    ];
  }

  if (operationalStatus === "preliminary") {
    return [
      {
        href: `/admin/patients/${patientId}/administrative`,
        label: "Gestión administrativa",
        kind: "primary",
      },
      {
        href: `/admin/patients/${patientId}/treatment`,
        label: "Tratamiento",
        kind: "secondary",
      },
    ];
  }

  return [
    {
      href: `/admin/patients/${patientId}/treatment`,
      label: "Tratamiento",
      kind: "secondary",
    },
    {
      href: `/admin/patients/${patientId}/encounters`,
      label: "Clínica",
      kind: "secondary",
    },
  ];
}
