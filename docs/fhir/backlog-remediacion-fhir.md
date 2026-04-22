# Backlog de implementación FHIR

> Estado: vigente
> Última actualización: 2026-04-22 (UTC)

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

## Agrupación por fase

### Fase 1
- FHIR-001 a FHIR-010

### Fase 2
- FHIR-011 a FHIR-012

### Fase 3
- FHIR-013 a FHIR-018

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

### FHIR-014 — Implementación mínima de `telecom`
**Objetivo:** reducir sobrecarga semántica del teléfono.
**Dependencias:** FHIR-013.
**Criterio de aceptación:** persistencia y UI reflejan la convención.

### FHIR-015 — Contrato transicional de `contact.relationship`
**Objetivo:** reducir texto libre no controlado.
**Dependencias:** ninguna.
**Criterio de aceptación:** catálogo mínimo publicado.

### FHIR-016 — Implementación mínima de `Patient.contact`
**Objetivo:** hacer consistente la relación de contacto.
**Dependencias:** FHIR-015.
**Criterio de aceptación:** relationship consistente en write/read/UI.

### FHIR-017 — Mejora incremental de `Patient.name`
**Objetivo:** ampliar expresividad mínima sin rediseño total.
**Dependencias:** ninguna crítica.
**Criterio de aceptación:** backward compatibility + tests.

### FHIR-018 — Deuda explícita de `Patient.address`
**Objetivo:** documentar trigger de evolución desde `address.text`.
**Dependencias:** ninguna.
**Criterio de aceptación:** criterio de salida documentado.
