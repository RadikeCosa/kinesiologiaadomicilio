# PRODUCT-SR-002 — Plan incremental de resolución y cambio de estado de solicitudes de atención

> Estado: PR4 completado (cierre documental + auditoría final)
> Fecha: 2026-04-28 (UTC)

## Objetivo de SR-002

Habilitar el cambio de estado de `ServiceRequest` en flujo administrativo, preservando separación estricta entre solicitud, tratamiento y visitas.

## Alcance de PR1 (este corte)

- Agregar soporte técnico de update de estado en capa mapper/repository.
- Implementar helper de escritura para aplicar transición de estado a un `ServiceRequest` FHIR existente.
- Implementar `updateServiceRequestStatus` en repository con validación, GET+PUT y mapeo de salida a dominio.
- Cubrir casos de update en tests de mapper/repository.

## Decisiones aplicadas en PR1

- Mapping de estado dominio -> FHIR:
  - `in_review` / `accepted` -> `active`;
  - `closed_without_treatment` / `cancelled` -> `revoked`;
  - `entered_in_error` -> `entered-in-error`.
- `closedReasonText` se persiste en `statusReason.text` para `closed_without_treatment` y `cancelled`.
- Cuando el nuevo estado no requiere motivo, `statusReason` se limpia.
- El update preserva campos no relacionados del recurso (`subject`, `authoredOn`, `reasonCode`, `requester`, `note`).

## No alcance preservado en PR1

- Sin server actions.
- Sin cambios de UI ni nuevas rutas.
- Sin cambios de `PatientOperationalStatus`.
- Sin inicio de tratamiento desde solicitudes.
- Sin cambios en `/treatment` ni `/encounters`.
- Sin vínculo SR↔EpisodeOfCare desde UI.

## Próximos PRs sugeridos

- PR5: hardening opcional (ownership paciente↔solicitud en action) si se considera necesario.
- PR6: PRODUCT-SR-003 (vinculación administrativa de solicitud aceptada con tratamiento, manteniendo `/treatment` como owner).

## Alcance de PR2 (completado)

- Se agregó `updatePatientServiceRequestStatusAction` en `administrative/actions.ts`.
- La action valida con `updateServiceRequestStatusSchema` y llama `updateServiceRequestStatus`.
- Revalida `/admin/patients/[id]/administrative` solo en éxito.
- Devuelve mensajes de éxito por estado (`accepted`, `closed_without_treatment`, `cancelled`) y error genérico para fallos.
- Se agregaron tests de acción para caminos felices, validación de motivo obligatorio, estado inválido, falla de repository y no-side-effects clínicos.

## Deuda de robustez (para PR5/hardening opcional)

- Ownership fuerte paciente↔solicitud no validado todavía en la action (se mantiene intencionalmente fuera de PR2 para no expandir alcance).

## Alcance de PR3 (completado)

- Se agregó `ServiceRequestStatusActions` como componente cliente en `/administrative`.
- Acciones visibles por estado:
  - `in_review`: `Aceptar`, `No inició`, `Cancelar`.
  - `accepted`: `No inició`, `Cancelar`.
  - terminales y `entered_in_error`: sin acciones estándar.
- `No inició` y `Cancelar` abren captura de motivo obligatorio y usan `updatePatientServiceRequestStatusAction`.
- Se muestra `closedReasonText` en el listado con label `Motivo de cierre/cancelación` cuando existe.
- Sin cambios de rutas, badges/CTAs globales ni estado operativo del paciente.

## Alcance de PR4 (completado)

- Auditoría de aceptación funcional SR-002 sobre código/tests/documentación.
- Verificación de no-regresión clínica/operativa:
  - sin inicio de tratamiento desde solicitud;
  - sin creación de `EpisodeOfCare`/`Encounter`;
  - sin impacto en `PatientOperationalStatus`;
  - sin cambios de rutas ni CTAs/badges globales.
- Sincronización documental mínima (`README`, fuente operativa y documentos de producto/FHIR vinculados).

## Estado final de ticket

**PRODUCT-SR-002: ✅ cerrado.**

## Nota de cierre posterior (2026-04-28)

Las deudas detectadas al cierre de SR-002 sobre fidelidad `accepted/in_review` y ownership paciente↔solicitud fueron atendidas en **PRODUCT-SR-HARDENING (PR1+PR2+PR3)**, que queda cerrado y habilita avance a SR-003.
