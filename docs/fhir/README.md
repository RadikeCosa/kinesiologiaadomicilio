# Documentación FHIR

> Estado: vigente
> Última actualización: 2026-06-02 (UTC)

## Objetivo

Mantener en esta carpeta solo la documentación FHIR operativa o reutilizable. Los planes, auditorías y cierres ya superados viven en `docs/archive/historico-fhir/`.

## Documentos activos

1. `adr-001-identidad-operativa-patient.md`
   - decisión vigente sobre identidad operativa, DNI y límites del modelo de `Patient.identifier`.

2. `fhir-episodeofcare-cierre-tratamiento.md`
   - contrato vigente para cierre de tratamiento con `EpisodeOfCare.status`, `period.end` y extensiones de motivo/detalle.

3. `fhir-practitioner-profesional-firmante.md`
   - contrato técnico para `Practitioner` como profesional firmante single-user, con identificador singleton, matrícula y extensión de display de firma.

4. `pr-checklist-remediacion-fhir.md`
   - checklist reusable para cambios FHIR que toquen contratos, mappers, repositorios, UI o documentación.

5. `ticket-template-fhir.md`
   - plantilla base para tickets técnicos FHIR nuevos.

## Archivo histórico

La remediación FHIR ya cerrada, los documentos `FHIR-013` a `FHIR-022`, los hardenings, auditorías puntuales, backlog y planes de Patient se archivaron en:

- `docs/archive/historico-fhir/`

Si alguno de esos documentos vuelve a ser relevante, debe referenciarse explícitamente desde `docs/fuente-de-verdad-operativa.md` o desde este índice con el contexto actualizado.

## Flujo recomendado de trabajo

1. Revisar `docs/fuente-de-verdad-operativa.md` para confirmar el comportamiento vigente.
2. Leer la ADR antes de tocar identidad, DNI o semántica de `Identifier`.
3. Usar el checklist FHIR cuando cambien recursos, mappers, repositorios, schemas, loaders/actions o UI con impacto FHIR.
4. Crear tickets nuevos desde la plantilla y mantenerlos en docs activos solo mientras guíen trabajo pendiente o vigente.

## Relación con otros documentos del repo

- `README.md`: estado general del producto y superficie implementada.
- `docs/fuente-de-verdad-operativa.md`: fuente principal para comportamiento operativo vigente.
- `docs/checklist-sincronizacion-doc-codigo.md`: control liviano antes de merge cuando cambian código, UI, dominio, FHIR o documentación.
- `docs/product/solicitud-atencion-flujo-inicial.md`: contrato de producto vigente para solicitudes de atención.
