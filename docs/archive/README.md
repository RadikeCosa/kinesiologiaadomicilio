# Archivo documental

> Estado: referencia histórica
> Última actualización: 2026-06-25 (UTC)

## Objetivo

Reunir material cerrado, superado o absorbido por documentación activa.

Regla práctica:

- si un documento ya no describe comportamiento vigente;
- si ya no guía trabajo actual;
- o si su contenido quedó consolidado en una fuente activa más simple,

entonces debería vivir acá y no en la superficie activa de `docs/`.

## Estructura actual

### `audits/`

Auditorías históricas o supersedidas por una auditoría posterior más precisa.

Incluye hoy:

- `auditoria-congruencia-docs-agents-estado-actual-2026-06-25.md`
- `auditoria-manejo-entornos-fhir-next-2026-06-25.md`

### `historico-fhir/`

Material FHIR que antes estaba separado en varios archivos y quedó consolidado en `docs/fhir/README.md`.

Incluye:

- `adr-001-identidad-operativa-patient.md`
- `fhir-episodeofcare-cierre-tratamiento.md`
- `fhir-practitioner-profesional-firmante.md`
- `pr-checklist-remediacion-fhir.md`
- `ticket-template-fhir.md`

### `normalization-data/`

Material previo de normalización y display que quedó consolidado en `docs/normalization-data/README.md`.

Incluye:

- `helpers-contract.md`

## Criterio de restauración

Si algún documento archivado vuelve a ser necesario, conviene:

1. rescatar solo el contexto útil;
2. reintroducirlo en un documento activo real;
3. evitar reabrir múltiples fuentes paralelas para el mismo contrato.
