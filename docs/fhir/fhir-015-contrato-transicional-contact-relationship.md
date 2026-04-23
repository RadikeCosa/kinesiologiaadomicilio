# FHIR-015 — Contrato transicional de `Patient.contact.relationship`

> Estado: aprobado para implementación incremental
> Fecha: 2026-04-23 (UTC)
> Alcance: **definición documental** de convención mínima para `Patient.contact.relationship` (sin cambios funcionales)

## 1) Auditoría del estado actual

### Contrato y dominio interno

- El contrato interno modela hoy `mainContact.relationship?: string` como texto libre.
- No existe vocabulario controlado en schema para ese campo.
- La estructura operativa sigue siendo de contacto principal único (`mainContact`), no multicontacto con prioridad.

### Capa FHIR actual

- En write, `mainContact.relationship` se serializa como `Patient.contact[0].relationship[0].text`.
- En read, se deserializa desde `Patient.contact[0].relationship[0].text` hacia `mainContact.relationship`.
- No se usa actualmente `CodeableConcept.coding` para controlar semántica.

### UI operativa actual

- La UI administrativa expone “Vínculo” como campo de entrada libre para contacto principal.
- En detalle se muestra ese valor tal como fue cargado.
- El producto mezcla hoy parentesco y rol operativo en un único campo textual (ej.: “Madre”, “Esposo”, “Cuidador”, “Vecina”).

## 2) Decisión de contrato transicional (FHIR-015)

### 2.1 ¿Qué representa `Patient.contact.relationship` en esta etapa?

Representa la **relación operativa del contacto principal con el paciente**, en un único atributo.

Regla de interpretación para esta etapa:
- el valor puede expresar parentesco o rol de cuidado/acompañamiento;
- su objetivo es operativo (a quién contactar y cómo lo reconoce el equipo), no legal/institucional.

### 2.2 Alcance estructural

- Se modela **solo para un contacto principal único**.
- No se define en esta etapa modelado de múltiples contactos ni prioridades.

### 2.3 Vocabulario controlado mínimo propuesto

Para reducir texto libre no controlado en la próxima implementación (FHIR-016), se define este catálogo transicional mínimo:

- `parent`
- `spouse`
- `child`
- `sibling`
- `caregiver`
- `other`

Mapeo de representación transicional esperado en FHIR:

```json
"contact": [
  {
    "relationship": [
      {
        "text": "<codigo-del-catalogo>"
      }
    ]
  }
]
```

En esta fase documental, el catálogo se define como contrato objetivo de transición; la implementación y normalización efectiva quedan para FHIR-016.

### 2.4 Coexistencia parentesco vs rol operativo

Para evitar ambigüedad en FHIR-016:

- si el caso encaja en parentesco habitual, usar código de parentesco (`parent`, `spouse`, `child`, `sibling`);
- si el caso describe función de cuidado/acompañamiento sin parentesco claro, usar `caregiver`;
- si no encaja de forma razonable, usar `other`.

No se abre en esta etapa un segundo campo separado para “rol” y “parentesco”.

## 3) Límites explícitos (fuera de alcance de FHIR-015)

En este ticket **no** se define ni implementa:

- múltiples contactos con prioridades o reglas de fallback;
- semántica formal rica de `guardian`/`caregiver` con perfiles externos;
- catálogos exhaustivos por institución o regulación;
- contacto institucional complejo (obra social, institución, representante legal con reglas propias);
- cambios funcionales de UI, actions, schemas, mappers o repositorios.

## 4) Rationale

- Refleja el estado real del producto (contacto principal único y campo hoy textual).
- Introduce un vocabulario mínimo chico y accionable sin sobre-modelar.
- Reduce ambigüedad para implementación posterior y evita abrir rediseño general de contacto.

## 5) Impacto esperado para FHIR-016

FHIR-016 debe limitarse a materializar esta convención con cambio mínimo:

1. aplicar catálogo mínimo en contrato/schemas/mappers del contacto principal;
2. mantener compatibilidad razonable con datos legacy de texto libre (normalización incremental o fallback controlado a `other`);
3. alinear UI administrativa para evitar carga de valores fuera de catálogo;
4. agregar tests de read/write/integración para `relationship` sin abrir multicontacto.

## 6) Criterio de salida de este ticket

FHIR-015 queda cerrado cuando:

- la convención de `Patient.contact.relationship` es explícita y utilizable;
- las fronteras de alcance están claras;
- FHIR-016 queda sin ambigüedad de diseño en relación, catálogo y compatibilidad legacy.
