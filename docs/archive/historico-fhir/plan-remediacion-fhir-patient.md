# Plan de remediación técnica FHIR — `Patient`

> Estado: vigente
> Última actualización: 2026-04-22 (UTC)

## Objetivo

Mejorar el modelado FHIR de `Patient` de forma incremental, sin rediseño total, priorizando brechas semánticas que hoy ya limitan crecimiento o generan incoherencia entre contrato, persistencia y UI.

## Criterio de priorización

1. brecha semántica alta;
2. inconsistencia end-to-end ya existente;
3. bajo riesgo de rollout incremental;
4. capacidad de validar el cambio por tests + UI + docs.

## Prioridades

### Cambios urgentes

- `Patient.gender` end-to-end.
- `Patient.birthDate` end-to-end en flujo real.
- alineación documental del contrato vigente.

### Cambios importantes pero no urgentes

- enriquecer `Patient.identifier` con `Identifier.type`;
- estabilizar semántica mínima de `telecom` y `contact.relationship`.

### Deuda controlada

- `Patient.name` más expresivo;
- evolución de `Patient.address` desde `text` a modelo estructurado.

## Fases

### Fase 1 — Contrato administrativo mínimo coherente

**Incluye**
- incorporar `gender` end-to-end;
- cerrar `birthDate` end-to-end;
- actualizar documentación.

**Impacto**
- dominio;
- schemas;
- mappers read/write;
- formularios de alta/edición;
- detalle del paciente;
- tests;
- docs.

### Fase 2 — Semántica mínima de identidad

**Incluye**
- mantener la regla operativa de DNI;
- agregar `Identifier.type`;
- actualizar fixtures/tests de identidad.

**Impacto**
- tipos FHIR locales;
- helpers de identificadores;
- mappers;
- tests;
- documentación de identidad.

### Fase 3 — Mejoras semánticas no bloqueantes

**Incluye**
- contrato transicional de `telecom`;
- contrato transicional de `Patient.contact.relationship`;
- mejora incremental de `Patient.name`;
- deuda explícita y trigger de evolución de `Patient.address`.

## Riesgos de no hacer nada

### Alto

- seguir escalando sin `gender` perpetúa un `Patient` administrativamente incompleto.
- mantener identidad semánticamente pobre sube costo de interoperabilidad futura.

### Medio-alto

- `birthDate` parcial erosiona confianza en el contrato técnico.

### Medio

- `telecom` y `contact` en texto libre aumentan heterogeneidad operativa.
- desalineación doc-código multiplica retrabajo.

## Regla de implementación

Cada fase debe cerrar con:

1. tests actualizados;
2. docs alineadas;
3. PR chico y trazable;
4. límites vigentes explícitos.
