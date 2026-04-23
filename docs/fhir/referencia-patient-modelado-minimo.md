# Referencia rápida — modelado mínimo recomendado de `Patient`

> Estado: referencia operativa
> Última actualización: 2026-04-23 (UTC)

## Objetivo

Servir como hoja de referencia rápida para tickets, revisiones y PRs del frente FHIR. No reemplaza la ADR ni el plan; resume el contrato mínimo recomendado para esta etapa del proyecto.

## Tabla de referencia

| Elemento FHIR | Estado objetivo mínimo | Evaluación hoy | Acción recomendada |
| --- | --- | --- | --- |
| `Patient.identifier` | `system` + `value` + `type` para DNI | parcial | enriquecer en Fase 2 |
| `Patient.name` | `family` + `given` simple y consistente | mejora incremental implementada | mantener compatibilidad sin rediseño completo |
| `Patient.gender` | presente end-to-end | faltante | corregir en Fase 1 |
| `Patient.birthDate` | presente end-to-end si existe en contrato | parcial | corregir en Fase 1 |
| `Patient.telecom` | contrato transicional explícito de canal | implementado mínimo | mantener convención y compatibilidad legacy |
| `Patient.address` | `address.text` aceptado como simplificación | deuda explícita documentada | evolucionar solo con triggers operativos claros |
| `Patient.contact` | contacto principal único con vocabulario controlado | implementación mínima completada | mantener alcance sin multicontacto |

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

**Implementado en FHIR-017**
- mejora incremental manteniendo modelo simple y compatible;
- sin rediseño completo de `HumanName`.

### `Patient.gender`

**Sí hacer ahora**
- soportarlo end-to-end en contrato, mapper, UI y tests.

### `Patient.birthDate`

**Sí hacer ahora**
- evitar que quede solo en tipos/mappers.

### `Patient.telecom`

**Ya definido en FHIR-013 (documental)**
- teléfono principal en `telecom` con `system: "phone"`;
- un único telecom principal;
- sin `use` en esta etapa;
- mismo número puede usarse operativamente para WhatsApp sin canal FHIR separado.

**Implementado en FHIR-014**
- read/write ya normalizados al contrato transicional de `telecom`;
- mantener compatibilidad con contrato/UI actuales basados en `phone`.

### `Patient.address`

**Aceptado hoy (FHIR-018)**
- `address.text` se mantiene como simplificación operativa explícita.

**Deuda y triggers documentados**
- geocodificación;
- filtros por localidad/zona;
- logística/ruteo más fino;
- integración con agenda/ruteo;
- interoperabilidad postal más rica.

### `Patient.contact`

**Implementado en FHIR-016**
- `Patient.contact.relationship` opera con catálogo mínimo controlado;
- contacto principal único, sin multicontacto ni priorización avanzada.

## Heurística de revisión rápida

Cuando revises un PR de este frente, preguntate:

1. ¿el campo quedó consistente en UI → action → schema → mapper → repositorio → read model → UI?
2. ¿la semántica es real o solo shape compatible?
3. ¿el cambio está documentado?
4. ¿no se abrió alcance de más?
