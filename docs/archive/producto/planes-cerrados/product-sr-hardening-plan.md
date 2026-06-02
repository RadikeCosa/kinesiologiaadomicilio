# PRODUCT-SR-HARDENING — Robustez de fidelidad de estado y ownership paciente↔solicitud

> Estado: cerrado (PR1 + PR2 + PR3 completados)
> Fecha: 2026-04-28 (UTC)

## Objetivo

Resolver deudas técnicas detectadas al cierre de SR-002 antes de SR-003:

1. fidelidad persistente de `accepted` vs `in_review`;
2. hardening de ownership paciente↔solicitud en actions.

## PR1 (completado)

- Se implementa desambiguación de `accepted` mediante note técnica versionada:
  - `workflow-status:v1:accepted`.
- Política aplicada:
  - write/update `accepted`: agrega/actualiza tag workflow;
  - write/update `in_review`, `closed_without_treatment`, `cancelled`, `entered_in_error`: limpia tags `workflow-status:v1:*`;
  - read `active` + `workflow-status:v1:accepted`: retorna dominio `accepted`;
  - read `active` sin marca o con marca desconocida: retorna `in_review`.
- Legacy-safe:
  - recursos previos con `active` sin marca siguen como `in_review`.

## PR2 (completado)

- `updatePatientServiceRequestStatusAction` valida ownership antes de update:
  - obtiene la solicitud con `getServiceRequestById(id)`;
  - si no existe o pertenece a otro paciente, retorna error genérico y no actualiza;
  - si pertenece, ejecuta `updateServiceRequestStatus`.
- La revalidación de `/admin/patients/[id]/administrative` ocurre solo en éxito.
- Se agregan tests negativos de inexistencia, ownership cruzado y falla de repositorios.

## PR3 (completado)

- Auditoría final técnico-funcional de hardening sobre mappers, action de update y test suites asociadas.
- Sincronización documental mínima en documentos de producto/FHIR para dejar explícito el cierre de hardening.
- Sin cambios de features, rutas, UI clínica, ownership de `/treatment` ni `/encounters`.

## Estado final

**PRODUCT-SR-HARDENING: ✅ cerrado.**
