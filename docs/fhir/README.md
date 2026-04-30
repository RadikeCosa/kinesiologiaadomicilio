# Documentación FHIR

> Estado: vigente
> Última actualización: 2026-04-28 (UTC)

## Objetivo

Centralizar la documentación de trabajo para la remediación técnica del modelado FHIR, con foco principal en `Patient` y su impacto en reglas operativas, UI, mappers, tests y documentación.

## Qué contiene esta carpeta

1. `adr-001-identidad-operativa-patient.md`
   - decisión de identidad operativa actual;
   - alcance del uso de DNI;
   - posición actual sobre `Identifier.type`;
   - límites explícitos (sin verificación RENAPER, sin modelo de identidad ampliado).

2. `plan-remediacion-fhir-patient.md`
   - plan por fases;
   - criterios de priorización;
   - impacto transversal por capa;
   - riesgos de no hacer nada.

3. `backlog-remediacion-fhir.md`
   - tickets FHIR-001 a FHIR-018;
   - dependencias;
   - criterio de aceptación y no alcance.

4. `pr-checklist-remediacion-fhir.md`
   - checklist obligatorio para PRs del backlog FHIR.

5. `ticket-template-fhir.md`
   - plantilla reutilizable para nuevos tickets técnicos FHIR.

6. `referencia-patient-modelado-minimo.md`
   - documento de referencia rápida;
   - contrato mínimo recomendado por elemento FHIR;
   - qué se considera correcto, transicional y fuera de alcance hoy.

7. `fhir-013-contrato-transicional-telecom.md`
   - convención transicional mínima de `Patient.telecom`;
   - decisión operativa para teléfono principal y caso WhatsApp;
   - límites explícitos para no mezclar alcance con FHIR-014.

8. `fhir-015-contrato-transicional-contact-relationship.md`
   - convención transicional mínima de `Patient.contact.relationship`;
   - catálogo mínimo de relación para contacto principal;
   - límites explícitos para no mezclar alcance con FHIR-016.

9. `fhir-018-deuda-address-trigger-evolucion.md`
   - deuda explícita de `Patient.address` manteniendo `address.text`;
   - triggers operativos para evolución futura a modelo estructurado;
   - límites de alcance mientras no aparezcan esos triggers.

10. `fhir-019-servicerequest-solicitudes-atencion.md`
   - referencia transicional previa a implementación para modelar solicitudes de atención con `ServiceRequest`;
   - decisiones aceptadas y abiertas de modelado para fases futuras;
   - no implica implementación vigente de `ServiceRequest` en código.

11. `../product/solicitud-atencion-flujo-inicial.md`
   - hipótesis funcional de producto y plan incremental;
   - separa carril Producto V0 (sin `ServiceRequest` persistido) del carril FHIR V1 futura.

12. `fhir-020-validacion-hapi-servicerequest-episodeofcare.md`
   - validación técnica en HAPI local (R4 4.0.1 / HAPI 8.8.0) del vínculo `EpisodeOfCare.referralRequest` ↔ `ServiceRequest`;
   - contrato de búsqueda confirmado con `incoming-referral`;
   - fallback recomendado de composición por `patient`.

13. `fhir-021-servicerequest-status-statusreason.md`
   - cierre documental del mapping transicional de `ServiceRequest.status`;
   - decisión de uso de `statusReason.text` para cierre sin tratamiento;
   - separación explícita entre estado FHIR de solicitud y estado operativo derivado.

14. `fhir-022-servicerequest-requester-busquedas.md`
   - cierre documental de requester transicional (`requester.display`) para V1;
   - definición de `requesterType`/`requesterContact` como deuda controlada de dominio/read-model;
   - contrato mínimo de búsquedas V1 y prohibición de `EpisodeOfCare?referralRequest=...`.

## Flujo recomendado de trabajo

1. Leer la ADR antes de tocar identidad, DNI o semántica de `Identifier` (DNI opcional, no gate de inicio de tratamiento).
2. Usar el plan de remediación para decidir orden y alcance.
3. Ejecutar tickets del backlog en PRs chicos.
4. Validar cada PR con el checklist específico.
5. Mantener este directorio alineado con `README.md` y `docs/fuente-de-verdad-operativa.md`.

## Regla de control de alcance

Ningún PR de este frente debería mezclar más de uno de estos grupos salvo que exista justificación explícita:

- contrato/schemas/mappers;
- UI administrativa;
- identidad/DNI;
- telecom/contact;
- documentación.

## Nota de política local (Encounter)

- Aunque FHIR permite omitir `Encounter.period.end`, la política operativa local para altas y edición temporal de visitas (`/admin/patients/[id]/encounters/new` y `/admin/patients/[id]/encounters`) requiere registrar inicio y cierre (`startedAt` y `endedAt` obligatorios).
- La lectura legacy mantiene tolerancia para `period.end` ausente y para históricos con `start === end`.

## Relación con otros documentos del repo

- `README.md`: estado general del producto y de la superficie implementada.
- `docs/fuente-de-verdad-operativa.md`: estado operativo vigente y límites actuales.
- `docs/arquitectura-objetivo-app-clinica.md`: dirección arquitectónica esperada.
- `docs/checklist-sincronizacion-doc-codigo.md`: control obligatorio por merge.

## Frente de remediación FHIR (Patient)

> Estado: **Fase 1 cerrada** (FHIR-002 a FHIR-010) + **Fase 2 cerrada** (FHIR-011 y FHIR-012).

## Alcance por fases

- **Fase 1 (cerrada):** `gender` + `birthDate` en contrato, schemas, mappers FHIR, UI privada (alta/edición/detalle) y cobertura de tests.
- **Fase 2 (cerrada):** `Identifier.type` + tests/fixtures de identidad.
- **Fase 3 (cerrada):** `telecom`, `contact.relationship`, `name`, `address` (remediación incremental completada; deuda de `address` documentada).

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
- `docs/fhir/fhir-013-contrato-transicional-telecom.md`
- `docs/fhir/fhir-015-contrato-transicional-contact-relationship.md`
- `docs/fhir/fhir-018-deuda-address-trigger-evolucion.md`
- `docs/fhir/fhir-019-servicerequest-solicitudes-atencion.md`
- `docs/fhir/fhir-020-validacion-hapi-servicerequest-episodeofcare.md`
- `docs/fhir/fhir-021-servicerequest-status-statusreason.md`
- `docs/fhir/fhir-022-servicerequest-requester-busquedas.md`
- `docs/product/solicitud-atencion-flujo-inicial.md`
