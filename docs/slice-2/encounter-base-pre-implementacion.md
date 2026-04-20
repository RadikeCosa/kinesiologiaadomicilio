# Slice 2 — Encounter base (implementado y cerrado)

> Estado: cierre de implementación
> Última actualización: 2026-04-20 (UTC)

## A) Objetivo del slice (cumplido)

Habilitar una capacidad mínima concreta para el flujo privado clínico:

- registrar visitas realizadas de un paciente (Encounter base);
- listar esas visitas en una superficie acotada por paciente;
- mantener coherencia operativa con tratamiento activo (`EpisodeOfCare`).

## B) Estado implementado real

### B.1 Superficie funcional disponible

- ruta implementada: `/admin/patients/[id]/encounters`;
- vista con:
  - contexto de paciente;
  - aviso de estado (con/sin tratamiento activo);
  - formulario simple de registro de visita;
  - listado de visitas existentes.

### B.2 Escritura implementada

- `create-encounter.action.ts`:
  - valida input con schema;
  - exige tratamiento activo (regla de negocio);
  - valida coherencia de `episodeOfCareId` contra episodio activo vigente;
  - persiste Encounter y devuelve mensaje operativo.

### B.3 Dominio Encounter implementado

- `encounter.types.ts`
- `encounter.schemas.ts`
- `encounter.rules.ts`

### B.4 Infraestructura Encounter implementada

- `infrastructure/repositories/encounter.repository.ts`
- `infrastructure/mappers/encounter/encounter-read.mapper.ts`
- `infrastructure/mappers/encounter/encounter-write.mapper.ts`
- `infrastructure/mappers/encounter/encounter-fhir.types.ts`

### B.5 Convención FHIR aplicada

Para Encounter base se usa convención simple y consistente:

- `Encounter.status = "finished"`;
- `Encounter.period.start = occurrenceDate`;
- `Encounter.period.end = occurrenceDate`.

## C) Criterios de cierre del slice

Todos los criterios de cierre previstos para Encounter base se consideran cumplidos:

1. Ruta privada de encounters por paciente implementada.
2. Action de creación con schema + regla de episodio activo.
3. Persistencia/lectura FHIR operativa mediante repositorio + mappers.
4. Dominio mínimo Encounter definido y usado.
5. Cobertura inicial de tests del slice presente (unitarios e integración).
6. Sin expansión de alcance a artefactos clínicos no previstos (`Observation`, `Procedure`, detalle rico, etc.).

## D) Límites vigentes tras cierre de Slice 2

Este cierre **no** implica historia clínica completa. Sigue fuera de alcance:

- detalle clínico rico por Encounter;
- edición compleja de visitas;
- longitudinal clínico avanzado;
- `Observation` / `Procedure`;
- auth productiva;
- agenda, pagos, `/portal`, multiusuario.

## E) Notas de mantenimiento

- Mantener consistencia entre:
  - `docs/fuente-de-verdad-operativa.md`
  - `docs/plan-v1-v2-app-clinica.md`
  - este documento de cierre.
- Si se amplía Encounter en slices siguientes, crear documento nuevo de slice (no reabrir este cierre).
