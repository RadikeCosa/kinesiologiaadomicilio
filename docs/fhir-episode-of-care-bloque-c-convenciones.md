# FHIR EpisodeOfCare (Bloque C) — convenciones vigentes

Documento de cierre técnico acotado para la migración actual de `EpisodeOfCare` a FHIR.

> Última actualización: 2026-04-17 (UTC)

## 1) Descripción breve del tratamiento (`EpisodeOfCare.note`)

- Lectura actual: se toma `EpisodeOfCare.note[*].text`, se eliminan vacíos y se consolida en un único `string` de dominio con `"\n\n"`.
- Escritura actual: la descripción breve se inserta/actualiza mediante helper dedicado (`upsertEpisodeDescriptionInNotes`).
- No hay dependencia contractual con `note[0]` fuera del helper.

## 2) Estado y relación con Patient

- En esta etapa, el episodio se crea con `status: "active"`.
- La finalización de tratamiento actualiza el episodio activo a `status: "finished"` y setea `period.end`.
- La relación con paciente se expresa en `EpisodeOfCare.patient.reference = "Patient/{id}"`.
- No se usa `initialContext` ni extensiones custom para este vínculo.

## 3) Límites vigentes del repositorio

- `getActiveEpisodeByPatientId` usa query simple: `EpisodeOfCare?patient=Patient/{id}&status=active`.
- `getMostRecentEpisodeByPatientId` usa query por paciente y selecciona el episodio con `period.start` más reciente.
- No hay paginación avanzada ni estrategia sofisticada de orden.
- No hay concurrencia optimista (`If-Match`/versionado) en este bloque.
- No hay historización avanzada ni manejo complejo de múltiples episodios activos.

## 4) Lectura operativa visible (con Encounter base implementado)

- Detalle de paciente:
  - prioriza episodio activo;
  - si no hay activo, usa el último episodio para mostrar tratamiento finalizado cuando corresponde.
- Listado de pacientes:
  - distingue estado operativo entre episodio activo, tratamiento finalizado y ausencia de tratamiento.
- Esta consistencia de estado se mantiene en el alcance actual y convive con Encounter base sin abrir longitudinal complejo.

## Deuda explícita vigente post-Encounter base

- Definir estrategia de cierre/historial de episodios cuando producto la requiera.
- Definir política de concurrencia optimista si aparece edición concurrente real.
- Revisar búsqueda/paginación solo cuando el volumen lo justifique.
