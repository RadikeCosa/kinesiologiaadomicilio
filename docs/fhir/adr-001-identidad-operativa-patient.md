# ADR-001 — Identidad operativa Patient

## Estado
Aceptada.

## Decisión vigente
Para la Fase 1 del frente FHIR Patient, la identidad operativa mínima queda soportada con:

- identificación administrativa ya existente del flujo;
- `gender` (catálogo FHIR) como dato opcional;
- `birthDate` (`YYYY-MM-DD`) como dato opcional.

## Consecuencia
Se habilita captura, edición, visualización y propagación técnica FHIR de `gender` + `birthDate` sin abrir todavía modelado rico de Fase 2/Fase 3.

## Límites explícitos
- Fase 2: `Identifier.type`.
- Fase 3: `telecom`, `contact.relationship`, `name`, `address`.
