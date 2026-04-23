# FHIR-013 — Contrato transicional de `Patient.telecom`

> Estado: aprobado para implementación incremental
> Fecha: 2026-04-23 (UTC)
> Alcance: **definición documental** de convención mínima para `Patient.telecom` (sin cambios funcionales)

## 1) Auditoría del estado actual

### Contrato y dominio interno

- El contrato interno de paciente usa hoy un campo plano `phone?: string` a nivel paciente.
- También existe `mainContact.phone?: string` para el contacto principal.
- No existe en el contrato interno un tipo explícito de canal (`phone`, `whatsapp`, etc.) ni prioridad de múltiples canales.

### Capa FHIR actual

- El mapper write ya serializa `phone` en `Patient.telecom` usando `system: "phone"` y `value`.
- El mapper read también lee `Patient.telecom` buscando el primer elemento con `system: "phone"` y lo proyecta al campo plano `phone`.
- No se modela semántica adicional (`use`, `rank`, múltiples canales con reglas de negocio).

### UI operativa actual

- La UI administrativa captura un único valor de teléfono (`phone`) en alta/edición.
- En detalle/listado, ese mismo dato se reutiliza para mostrar teléfono y para construir link de WhatsApp cuando el valor es utilizable.
- Operativamente existe sobrecarga semántica: un mismo dato puede representar “teléfono” y, de hecho, ser usado como canal de WhatsApp.

## 2) Decisión de contrato transicional (FHIR-013)

### 2.1 ¿El teléfono principal debe vivir en `Patient.telecom` en esta etapa?

**Sí.** La convención transicional establece que el teléfono principal del paciente se representa en FHIR como `Patient.telecom`.

### 2.2 Semántica mínima acordada

Para esta etapa, la convención mínima es:

- modelar **solo canal telefónico**: `system: "phone"`;
- **no usar `use`** por ahora (queda fuera para evitar semántica no soportada por producto);
- publicar **como máximo un único telecom principal** por paciente en esta transición;
- `value` contiene el mismo teléfono operativo hoy usado por contrato/UI.

Forma esperada mínima:

```json
"telecom": [
  {
    "system": "phone",
    "value": "<telefono-principal>"
  }
]
```

Si no hay teléfono informado, `telecom` puede omitirse.

### 2.3 Caso operativo: mismo número para teléfono y WhatsApp

Se documenta explícitamente que, en el estado actual del producto, **un único número operativo puede usarse tanto para llamada como para WhatsApp**.

Regla transicional:

- FHIR sigue representando ese dato como `system: "phone"`.
- El uso en WhatsApp se considera una **convención operativa de la UI/producto**, no un canal FHIR diferenciado en esta etapa.

Esto evita inventar una semántica formal de WhatsApp todavía no soportada end-to-end.

## 3) Límites explícitos (fuera de alcance de FHIR-013)

En este ticket **no** se define ni implementa:

- semántica formal de WhatsApp como canal FHIR dedicado;
- múltiples `telecom` simultáneos con reglas de prioridad compleja;
- uso de `use`, `rank` o taxonomías de canales ricos;
- rediseño de UI, acciones, schemas o mappers productivos;
- cambios de `Patient.contact.relationship`, `name` o `address`.

## 4) Rationale

- Mantiene coherencia con la realidad actual del producto (un teléfono operativo principal).
- Reduce ambigüedad para implementación posterior sin abrir un rediseño grande.
- Evita sobre-modelado prematuro de interoperabilidad no disponible hoy.

## 5) Impacto esperado para FHIR-014

FHIR-014 debe limitarse a **materializar esta convención** en implementación mínima:

1. asegurar write/read consistentes con un único `telecom` `system: "phone"`;
2. mantener compatibilidad con contrato/UI actuales basados en `phone`;
3. cubrir tests/fixtures mínimos de la convención;
4. no abrir todavía modelado multi-canal ni semántica formal de WhatsApp.

## 6) Criterio de salida de este ticket

FHIR-013 queda cerrado cuando:

- la convención está explícita, corta y trazable;
- no hay contradicción con README, fuente de verdad operativa, plan y backlog;
- la deuda para FHIR-014 queda documentada sin ambigüedad.
