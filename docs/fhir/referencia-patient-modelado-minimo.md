# Referencia — Patient modelado mínimo vigente

## Campos administrativos de Fase 1

- `gender` (FHIR-compatible): `male | female | other | unknown`.
- `birthDate`: string `YYYY-MM-DD`.

## Estado de soporte actual

- **Contrato interno**: soporta ambos campos como opcionales.
- **Schemas**: validan catálogo/formato y rechazan inválidos.
- **FHIR mappers**: lectura y escritura cubiertas.
- **UI privada**:
  - alta: captura `gender` + `birthDate`;
  - edición: actualiza `gender` + `birthDate`;
  - detalle/hub: renderiza `gender` + `birthDate` con fallback discreto cuando faltan.

## Alcance explícito fuera de esta referencia

- `Identifier.type` (Fase 2).
- modelado rico de `telecom`, `contact.relationship`, `name`, `address` (Fase 3).
