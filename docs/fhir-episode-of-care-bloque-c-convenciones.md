# FHIR EpisodeOfCare (Bloque C) — convenciones vigentes

Documento de cierre técnico acotado para la migración actual de `EpisodeOfCare` a FHIR.

## 1) Descripción breve del tratamiento (`EpisodeOfCare.note`)

- Lectura actual: se toma `EpisodeOfCare.note[*].text`, se eliminan vacíos y se consolida en un único `string` de dominio con `"\n\n"`.
- Escritura actual: la descripción breve se inserta/actualiza mediante helper dedicado (`upsertEpisodeDescriptionInNotes`).
- No hay dependencia contractual con `note[0]` fuera del helper.

## 2) Estado y relación con Patient

- En esta etapa, el episodio se persiste con `status: "active"`.
- La relación con paciente se expresa en `EpisodeOfCare.patient.reference = "Patient/{id}"`.
- No se usa `initialContext` ni extensiones custom para este vínculo.

## 3) Límites vigentes del repositorio

- `getActiveEpisodeByPatientId` usa query simple: `EpisodeOfCare?patient=Patient/{id}&status=active`.
- No hay paginación avanzada ni estrategia sofisticada de orden.
- No hay concurrencia optimista (`If-Match`/versionado) en este bloque.
- No hay historización avanzada ni manejo complejo de múltiples episodios activos.

## Deuda explícita antes de Encounter

- Definir estrategia de cierre/historial de episodios cuando producto la requiera.
- Definir política de concurrencia optimista si aparece edición concurrente real.
- Revisar búsqueda/paginación solo cuando el volumen lo justifique.
