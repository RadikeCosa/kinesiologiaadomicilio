# Documentación activa

Esta carpeta quedó reducida a documentación útil para dos lectores:

- desarrollo actual del producto;
- recruiters o reviewers técnicos que necesiten entender rápido qué tipo de proyecto es este repo.

## Si venís por primera vez

1. `README.md`
   Presentación pública del proyecto como case study HealthTech.
2. `docs/fuente-de-verdad-operativa.md`
   Comportamiento vigente confirmado en código.
3. `docs/fhir/README.md`
   Referencia FHIR activa consolidada.

## Para recruiters

- `README.md`
- `docs/screenshots/README.md`
- `docs/arquitectura-objetivo-app-clinica.md`

Estas piezas explican el contexto clínico, el valor profesional del proyecto y la dirección técnica sin obligar a leer auditorías históricas.

## Para desarrollo

- `docs/fuente-de-verdad-operativa.md`
  Fuente principal cuando haya dudas sobre rutas, responsabilidades, flujos y límites actuales.
- `docs/product/solicitud-atencion-flujo-inicial.md`
  Contrato operativo vigente para solicitudes de atención.
- `docs/fhir/README.md`
  Punto de entrada para contratos y checklists FHIR.
- `docs/analytics-handoff.md`
  Tracking público vigente con GA4.
- `docs/normalization-data/README.md`
  Convenciones de normalización y display de datos administrativos.
- `docs/checklist-sincronizacion-doc-codigo.md`
  Checklist liviano para evitar drift entre código y documentación.
- `docs/audits/auditoria-congruencia-post-entornos-fhir-2026-06-25.md`
  Auditoría vigente más reciente para el cierre documental posterior al Patch 1 de entornos FHIR.
- `docs/archive/README.md`
  Mapa del material histórico que sigue versionado.

## Historial y archivo

La documentación histórica o ya absorbida por documentos activos no debería quedar mezclada con la documentación principal.

Si sigue siendo útil como referencia versionada, vive en:

- `docs/archive/`

En particular:

- la auditoría post-patch vigente puede permanecer en `docs/audits/` si sigue guiando el siguiente patch;
- auditorías pre-patch o ya supersedidas deberían moverse a `docs/archive/`.

Si existe localmente, vive en:

- `docs-local/archive/`

Regla práctica:

- si un documento no describe comportamiento vigente, ni guía trabajo actual, ni ayuda a explicar el proyecto hacia afuera, no debería seguir versionado en el remoto;
- si un documento histórico vuelve a ser importante, conviene resumirlo o reintroducir solo la parte necesaria desde un documento activo.
