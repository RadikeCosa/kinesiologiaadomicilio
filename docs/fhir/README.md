# Frente de remediación FHIR (Patient)

> Estado: **Fase 1 cerrada** (tickets FHIR-002 a FHIR-009 implementados en código/tests; FHIR-010 documenta el cierre).

## Alcance por fases

- **Fase 1 (cerrada):** `gender` + `birthDate` en contrato, schemas, mappers FHIR, UI privada (alta/edición/detalle) y cobertura de tests.
- **Fase 2 (pendiente):** `Identifier.type`.
- **Fase 3 (pendiente):** `telecom`, `contact.relationship`, `name`, `address` (modelado más rico).

## Evidencia de Fase 1

- `gender` y `birthDate` viajan en create/update (`Patient`) y se renderizan en la UI privada.
- Schemas rechazan `gender` inválido y `birthDate` inválida.
- Mappers FHIR read/write cubiertos para ambos campos.
- Se validaron escenarios legacy sin `gender`/`birthDate`.

## Documentos de referencia del frente

- `docs/fhir/plan-remediacion-fhir-patient.md`
- `docs/fhir/backlog-remediacion-fhir.md`
- `docs/fhir/referencia-patient-modelado-minimo.md`
- `docs/fhir/pr-checklist-remediacion-fhir.md`
- `docs/fhir/adr-001-identidad-operativa-patient.md`
