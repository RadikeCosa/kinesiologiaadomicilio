# EpisodeOfCare — cierre de tratamiento

- Al finalizar tratamiento se persiste `status = finished` y `period.end`.
- Además, se registra motivo de finalización y detalle opcional.
- Motivo/detalle se persisten en `EpisodeOfCare.extension[]` con URLs propias versionables:
  - `https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason` (`valueCode`)
  - `https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail` (`valueString`)
- `note[]` se descarta como canal principal para cierre de `EpisodeOfCare` porque HAPI local lo elimina en roundtrip PUT/GET.
- La lectura mantiene fallback legacy desde `note[]` (`closure-reason:v1:` / `closure-detail:v1:`) para compatibilidad histórica.
- Estos datos son contexto operativo de cierre, no historia clínica longitudinal rica.
