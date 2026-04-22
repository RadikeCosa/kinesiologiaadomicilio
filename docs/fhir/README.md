# Documentación FHIR

> Estado: vigente
> Última actualización: 2026-04-22 (UTC)

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

## Flujo recomendado de trabajo

1. Leer la ADR antes de tocar identidad, DNI o semántica de `Identifier`.
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

## Relación con otros documentos del repo

- `README.md`: estado general del producto y de la superficie implementada.
- `docs/fuente-de-verdad-operativa.md`: estado operativo vigente y límites actuales.
- `docs/arquitectura-objetivo-app-clinica.md`: dirección arquitectónica esperada.
- `docs/checklist-sincronizacion-doc-codigo.md`: control obligatorio por merge.