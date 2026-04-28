# Backlog de implementación FHIR

> Estado: vigente
> Última actualización: 2026-04-28 (UTC)

## Orden recomendado de ejecución

1. FHIR-001 — ADR identidad operativa y `Identifier.type`
2. FHIR-002 — Contrato dominio `Patient`: agregar `gender`
3. FHIR-003 — Schemas `Patient`: validar `gender` + `birthDate`
4. FHIR-004 — Mapper/tipo FHIR `Patient`: soporte `gender`
5. FHIR-005 — UI alta `Patient`: capturar `gender`
6. FHIR-006 — UI edición/detalle `Patient`: `gender`
7. FHIR-007 — UI alta `Patient`: capturar `birthDate`
8. FHIR-008 — UI edición/detalle `Patient`: `birthDate`
9. FHIR-009 — Test suite `Patient` Fase 1
10. FHIR-010 — Documentación Fase 1
11. FHIR-011 — Enriquecer `Patient.identifier` con `Identifier.type`
12. FHIR-012 — Fixtures/tests identidad con `Identifier.type`
13. FHIR-013 — Definición contrato transicional `telecom`
14. FHIR-014 — Implementación mínima `telecom`
15. FHIR-015 — Definición contrato transicional `contact.relationship`
16. FHIR-016 — Implementación mínima `Patient.contact`
17. FHIR-017 — Mejora incremental `Patient.name`
18. FHIR-018 — Deuda explícita y trigger de evolución `Patient.address`
19. FHIR-019 — ADR/modelado transicional `ServiceRequest`
20. FHIR-020 — Validar HAPI/R4 para vínculo `ServiceRequest` ↔ `EpisodeOfCare.referralRequest`
21. FHIR-021 — Cerrar mapping transicional de `ServiceRequest.status/statusReason`
22. FHIR-022 — Definir requester transicional y estrategia de búsqueda mínima
23. FHIR-023 — Implementación incremental (`types/schemas/mappers/repository`) de `ServiceRequest`

## Agrupación por fase

### Fase 1
- FHIR-001 a FHIR-010

### Fase 2
- FHIR-011 a FHIR-012

### Fase 3
- FHIR-013 a FHIR-018

### Fase 4 (futura)
- FHIR-019 a FHIR-023

> Gate recomendado antes de Fase 4: cerrar primero Producto V0 en `/admin/patients/[id]/administrative` (lectura + acciones, sin `ServiceRequest` persistido, sin rutas nuevas y sin cambios en `EpisodeOfCare`/`Encounter`).

## Tickets

### FHIR-001 — ADR identidad operativa y semántica de identificador
**Objetivo:** cerrar decisiones previas antes de tocar código sensible.
**Dependencias:** ninguna.
**Criterio de aceptación:** documento aprobado y referenciado.

### FHIR-002 — Contrato dominio: agregar `gender`
**Objetivo:** incorporar `gender` en contrato interno.
**Dependencias:** definición de catálogo.
**Criterio de aceptación:** tipos/read models compilan sin romper consumidores.

### FHIR-003 — Schemas: validar `gender` + `birthDate`
**Objetivo:** asegurar entrada coherente desde actions.
**Dependencias:** FHIR-002.
**Criterio de aceptación:** tests de schema válidos/inválidos cubiertos.

### FHIR-004 — Mapper/tipo FHIR `Patient`: soporte `gender`
**Objetivo:** cerrar mapping técnico end-to-end.
**Dependencias:** FHIR-002, FHIR-003.
**Criterio de aceptación:** read/write mapper tests verdes.

### FHIR-005 — UI alta: agregar `gender`
**Objetivo:** capturar `gender` en alta.
**Dependencias:** FHIR-003, FHIR-004.
**Criterio de aceptación:** create persiste `gender`.

### FHIR-006 — UI edición/detalle: agregar `gender`
**Objetivo:** editar y visualizar `gender`.
**Dependencias:** FHIR-004.
**Criterio de aceptación:** update/read reflejan `gender`.

### FHIR-007 — UI alta: habilitar `birthDate`
**Objetivo:** cerrar brecha contrato vs alta.
**Dependencias:** FHIR-003.
**Criterio de aceptación:** create persiste `birthDate`.

### FHIR-008 — UI edición/detalle: habilitar `birthDate`
**Objetivo:** cerrar brecha contrato vs lectura/edición.
**Dependencias:** FHIR-004.
**Criterio de aceptación:** edición y visualización consistentes.

### FHIR-009 — Consolidación de tests Fase 1
**Objetivo:** blindar regressions de `gender` + `birthDate`.
**Dependencias:** FHIR-005 a FHIR-008.
**Criterio de aceptación:** suite verde con cobertura explícita.

### FHIR-010 — Documentación Fase 1
**Objetivo:** alinear docs con contrato implementado.
**Dependencias:** FHIR-009.
**Criterio de aceptación:** docs describen exactamente el comportamiento vigente.

### FHIR-011 — `Identifier.type`
**Objetivo:** enriquecer semántica de DNI en FHIR.
**Dependencias:** FHIR-001.
**Criterio de aceptación:** `Patient.identifier` incluye `type`.

### FHIR-012 — Tests/fixtures de identidad
**Objetivo:** estabilizar comportamiento tras FHIR-011.
**Dependencias:** FHIR-011.
**Criterio de aceptación:** búsqueda/duplicado por DNI se mantiene.

### FHIR-013 — Contrato transicional de `telecom`
**Objetivo:** fijar semántica mínima de canal.
**Dependencias:** ninguna.
**Criterio de aceptación:** convención clara y aprobada.
**Entregable documental:** `docs/fhir/fhir-013-contrato-transicional-telecom.md`.

### FHIR-014 — Implementación mínima de `telecom`
**Objetivo:** reducir sobrecarga semántica del teléfono.
**Dependencias:** FHIR-013.
**Criterio de aceptación:** persistencia y UI reflejan la convención transicional (`system: "phone"`, único telecom principal, sin `use`).

### FHIR-015 — Contrato transicional de `contact.relationship`
**Objetivo:** reducir texto libre no controlado.
**Dependencias:** ninguna.
**Criterio de aceptación:** catálogo mínimo publicado.
**Entregable documental:** `docs/fhir/fhir-015-contrato-transicional-contact-relationship.md`.

### FHIR-016 — Implementación mínima de `Patient.contact`
**Objetivo:** hacer consistente la relación de contacto.
**Dependencias:** FHIR-015.
**Criterio de aceptación:** relationship consistente en write/read/UI para contacto principal único con catálogo mínimo (`parent`, `spouse`, `child`, `sibling`, `caregiver`, `other`).

### FHIR-017 — Mejora incremental de `Patient.name`
**Objetivo:** ampliar expresividad mínima sin rediseño total.
**Dependencias:** ninguna crítica.
**Criterio de aceptación:** backward compatibility + tests.

### FHIR-018 — Deuda explícita de `Patient.address`
**Objetivo:** documentar trigger de evolución desde `address.text`.
**Dependencias:** ninguna.
**Criterio de aceptación:** criterio de salida documentado.
**Entregable documental:** `docs/fhir/fhir-018-deuda-address-trigger-evolucion.md`.

### FHIR-019 — ADR/modelado transicional `ServiceRequest`
**Objetivo:** establecer referencia transicional previa a implementación para solicitudes de atención con `ServiceRequest`.
**Dependencias:** ninguna.
**Criterio de aceptación:** documento FHIR-019 aprobado como base de trabajo.
**Entregable documental:** `docs/fhir/fhir-019-servicerequest-solicitudes-atencion.md`.

### FHIR-020 — Validar HAPI/R4 para vínculo `ServiceRequest` ↔ `EpisodeOfCare.referralRequest`
**Estado:** cerrado documentalmente (2026-04-28).
**Objetivo:** confirmar viabilidad real del vínculo propuesto y definir fallback si no aplica.
**Dependencias:** FHIR-019.
**Criterio de aceptación:** decisión técnica documentada (viable/no viable + fallback).
**Resultado:** viable en HAPI local; contrato de query por vínculo: `EpisodeOfCare?incoming-referral=...`; `EpisodeOfCare?referralRequest=...` inválido (`HAPI-0524`).
**Referencia:** `docs/fhir/fhir-020-validacion-hapi-servicerequest-episodeofcare.md`.

### FHIR-021 — Cerrar mapping transicional de `ServiceRequest.status/statusReason`
**Estado:** cerrado documentalmente (2026-04-28).
**Objetivo:** definir mapping operativo estable para estados y cierre sin tratamiento.
**Dependencias:** FHIR-019, FHIR-020.
**Criterio de aceptación:** tabla de mapping acordada y documentada para implementación.
**Resultado:** `in_review`/`accepted` → `active`; `closed_without_treatment`/`cancelled` → `revoked`; `entered_in_error` → `entered-in-error`; uso de `statusReason.text` para motivo de cierre.
**Referencia:** `docs/fhir/fhir-021-servicerequest-status-statusreason.md`.

### FHIR-022 — Definir requester transicional y estrategia de búsqueda mínima
**Estado:** cerrado documentalmente (2026-04-28).
**Objetivo:** cerrar decisión de requester (`display`, dominio y/o extensión futura) y búsquedas mínimas en HAPI.
**Dependencias:** FHIR-019.
**Criterio de aceptación:** convención documentada y criterios de búsqueda validados.
**Resultado:** requester V1 con `requester.display`; `requesterType` y `requesterContact` quedan en dominio/read-model con fallback transicional en `note`; contrato de búsqueda mínima documentado.
**Referencia:** `docs/fhir/fhir-022-servicerequest-requester-busquedas.md`.

### FHIR-023 — Implementación incremental de `ServiceRequest` (cerrado técnico)
**Estado:** cerrado técnicamente (PR1→PR5 completados, 2026-04-28).
**Objetivo:** ejecutar implementación mínima en orden: tipos/schemas → mappers → repositorio.
**Dependencias:** FHIR-020, FHIR-021, FHIR-022.
**Criterio de aceptación:** implementación incremental con tests y documentación sincronizada.
**Resultado:**
- PR1 completado: contrato de dominio mínimo (`types` + `schemas`) y tests de dominio para create/status.
- PR2 completado: mappers FHIR read/write de `ServiceRequest` (status mapping, note tagging y tests de mapper).
- PR3 completado: repository + search params de `ServiceRequest` (create/list/get por subject con tests).
- PR4 completado: soporte técnico de vínculo EoC↔SR por `incoming-referral` (builder + query de repository + tests sin UI).
- PR5 completado: integración técnica mínima en loader/read-model interno (composición de ServiceRequest sin UI visible ni cambio de estado operativo).
