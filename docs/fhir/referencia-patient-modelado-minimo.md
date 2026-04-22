# Referencia rápida — modelado mínimo recomendado de `Patient`

> Estado: referencia operativa
> Última actualización: 2026-04-22 (UTC)

## Objetivo

Servir como hoja de referencia rápida para tickets, revisiones y PRs del frente FHIR. No reemplaza la ADR ni el plan; resume el contrato mínimo recomendado para esta etapa del proyecto.

## Tabla de referencia

| Elemento FHIR | Estado objetivo mínimo | Evaluación hoy | Acción recomendada |
| --- | --- | --- | --- |
| `Patient.identifier` | `system` + `value` + `type` para DNI | parcial | enriquecer en Fase 2 |
| `Patient.name` | `family` + `given` simple y consistente | aceptable transicionalmente | mantener y mejorar después |
| `Patient.gender` | presente end-to-end | faltante | corregir en Fase 1 |
| `Patient.birthDate` | presente end-to-end si existe en contrato | parcial | corregir en Fase 1 |
| `Patient.telecom` | contrato transicional explícito de canal | débil | definir e implementar en Fase 3 |
| `Patient.address` | `address.text` aceptado como simplificación | aceptable transicionalmente | documentar deuda |
| `Patient.contact` | contacto principal único con vocabulario controlado | parcial | mejorar en Fase 3 |

## Guías rápidas por campo

### `Patient.identifier`

**Sí hacer ahora**
- mantener búsqueda por `system|value`;
- explicitar que DNI es regla operativa vigente;
- agregar `Identifier.type` en la fase definida.

**No hacer todavía**
- modelar validación RENAPER inexistente;
- introducir múltiples estrategias de identidad sin decisión previa.

### `Patient.name`

**Sí hacer ahora**
- mantener un caso simple consistente.

**No hacer todavía**
- abrir un rediseño completo de `HumanName`.

### `Patient.gender`

**Sí hacer ahora**
- soportarlo end-to-end en contrato, mapper, UI y tests.

### `Patient.birthDate`

**Sí hacer ahora**
- evitar que quede solo en tipos/mappers.

### `Patient.telecom`

**Sí hacer después**
- definir qué representa el teléfono actual;
- documentar cuándo un mismo número se usa como WhatsApp.

### `Patient.address`

**Aceptar hoy**
- `address.text` como simplificación explícita.

**Revisar si aparece**
- necesidad de geocodificación;
- filtros por localidad;
- integración logística más fina.

### `Patient.contact`

**Sí hacer después**
- vocabulario mínimo de relación;
- mantener contacto principal único mientras el alcance siga chico.

## Heurística de revisión rápida

Cuando revises un PR de este frente, preguntate:

1. ¿el campo quedó consistente en UI → action → schema → mapper → repositorio → read model → UI?
2. ¿la semántica es real o solo shape compatible?
3. ¿el cambio está documentado?
4. ¿no se abrió alcance de más?
