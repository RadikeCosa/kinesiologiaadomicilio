# EpisodeOfCare — cierre de tratamiento

- Al finalizar tratamiento se persiste `status = finished` y `period.end`.
- Además, se registra motivo de finalización y detalle opcional.
- En esta etapa, motivo/detalle se guardan en `EpisodeOfCare.note[]` con prefijos versionados:
  - `closure-reason:v1:<reason>`
  - `closure-detail:v1:<detail>`
- Estos datos son contexto operativo de cierre, no historia clínica longitudinal rica.
