# PR checklist — remediación FHIR

## Checklist de cierre Fase 1 (estado actual)

- [x] `gender` y `birthDate` presentes en contrato interno `Patient`.
- [x] Schemas validan catálogo de `gender` y formato de `birthDate` (`YYYY-MM-DD`).
- [x] Mappers/tipos FHIR propagan `gender` y `birthDate` de forma consistente.
- [x] UI privada captura/renderiza `gender` y `birthDate` (alta/edición/detalle).
- [x] Tests de schemas/mappers/actions/vistas cubren casos válidos, inválidos y legacy.
- [x] Sin claims fuera de alcance (Fase 2/Fase 3 siguen pendientes).

## Checklist para próximas fases

- [ ] Fase 2 (`Identifier.type`) definida y validada end-to-end.
- [ ] Fase 3 (`telecom`, `contact.relationship`, `name`, `address`) planificada e implementada incrementalmente.
