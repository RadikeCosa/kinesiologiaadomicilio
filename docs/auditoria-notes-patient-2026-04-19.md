# Auditoría técnica — notas generales de paciente (`Patient.note`)

> Fecha de auditoría actualizada: 2026-04-20 (UTC)
> Alcance: estado real de captura/persistencia/render de notas en superficie privada.

## Diagnóstico ejecutivo

Al estado actual del repositorio, **no existe funcionalidad activa de notas generales de paciente** en el flujo privado:

- no se capturan notas en formularios de alta/edición de paciente;
- no se persisten notas en los mappers write de `Patient`;
- no se exponen notas en read models de detalle/listado;
- no se renderizan notas en la UI de detalle del paciente.

## Evidencia en código (resumen)

1. `PatientEditForm` edita DNI, teléfono, dirección y contacto principal, sin campo `notes`.
2. `PatientDetailReadModel` no define `patientNotes` ni equivalente.
3. `mapCreatePatientInputToFhir` y `mapUpdatePatientInputToFhir` no mapean `Patient.note`.
4. `mapFhirPatientToDomain` no lee `Patient.note`.
5. `PatientDetailView` no renderiza bloque de notas.

## Estado documental esperado (alineado)

Para evitar ambigüedad, los documentos operativos deben tratar notas como **fuera de alcance actual** hasta que exista implementación real.

Texto de referencia recomendado:

> “La superficie privada actual no guarda ni renderiza notas generales del paciente (`Patient.note`).”

## Fuera de alcance vigente relacionado

- notas generales persistidas de paciente;
- historial clínico longitudinal rico;
- `Observation` / `Procedure`.

## Criterio para reabrir este tema

Reabrir la auditoría de notas únicamente cuando exista PR funcional que incluya, como mínimo:

1. campo de captura en UI,
2. mapeo write/read consistente,
3. render en detalle,
4. tests unit/integration del circuito.
