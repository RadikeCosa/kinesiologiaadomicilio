# Plan de remediación FHIR — Patient

## Estado por ticket

| Ticket | Objetivo | Estado |
| --- | --- | --- |
| FHIR-002 | Contrato dominio `Patient`: agregar `gender` | ✅ Cerrado |
| FHIR-003 | Schemas `Patient`: validar `gender` + `birthDate` | ✅ Cerrado |
| FHIR-004 | Mapper/tipo FHIR `Patient`: soporte `gender` | ✅ Cerrado |
| FHIR-005 | UI alta `Patient`: capturar `gender` | ✅ Cerrado |
| FHIR-006 | UI edición/detalle `Patient`: `gender` | ✅ Cerrado |
| FHIR-007 | UI alta `Patient`: habilitar `birthDate` | ✅ Cerrado |
| FHIR-008 | UI edición/detalle `Patient`: `birthDate` | ✅ Cerrado |
| FHIR-009 | Consolidación de tests Fase 1 | ✅ Cerrado |
| FHIR-010 | Documentación Fase 1 | ✅ Cerrado |

## Resultado de Fase 1

Fase 1 queda cerrada con soporte real de `gender` y `birthDate` en:

- contrato interno y read models;
- schemas de entrada;
- mappers/tipos FHIR;
- UI privada de alta/edición/detalle;
- tests de regresión relevantes.

## Límites vigentes (no incluidos en Fase 1)

- Fase 2: `Identifier.type`.
- Fase 3: `telecom`, `contact.relationship`, `name`, `address` (modelado más rico).
