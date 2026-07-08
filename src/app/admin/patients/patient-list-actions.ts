import type { PatientOperationalStatus } from "@/domain/patient/patient.types";

export interface PatientListAction {
  href: string;
  label: string;
  kind: "primary" | "secondary";
}

export function getPatientListActions(input: {
  patientId: string;
  operationalStatus: PatientOperationalStatus;
  hasAcceptedPendingTreatment?: boolean;
}): PatientListAction[] {
  const { patientId, operationalStatus, hasAcceptedPendingTreatment = false } = input;

  if (operationalStatus === "active_treatment") {
    return [
      {
        href: `/admin/patients/${patientId}/encounters/new`,
        label: "Registrar visita",
        kind: "primary",
      },
      {
        href: `/admin/patients/${patientId}/encounters`,
        label: "Gestión clínica",
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
    if (hasAcceptedPendingTreatment) {
      return [
        {
          href: `/admin/patients/${patientId}/treatment`,
          label: "Ver tratamiento",
          kind: "primary",
        },
        {
          href: `/admin/patients/${patientId}/administrative`,
          label: "Gestión administrativa",
          kind: "secondary",
        },
      ];
    }

    return [
      {
        href: `/admin/patients/${patientId}/administrative`,
        label: "Gestión administrativa",
        kind: "primary",
      },
      {
        href: `/admin/patients/${patientId}/treatment`,
        label: "Ver tratamiento",
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

  if (hasAcceptedPendingTreatment) {
    return [
      {
        href: `/admin/patients/${patientId}/treatment`,
        label: "Ver tratamiento",
        kind: "primary",
      },
      {
        href: `/admin/patients/${patientId}/administrative`,
        label: "Gestión administrativa",
        kind: "secondary",
      },
    ];
  }

  return [
    {
      href: `/admin/patients/${patientId}/treatment`,
      label: "Ver tratamiento",
      kind: "secondary",
    },
    {
      href: `/admin/patients/${patientId}/encounters`,
      label: "Gestión clínica",
      kind: "secondary",
    },
  ];
}
