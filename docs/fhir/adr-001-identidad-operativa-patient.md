# ADR-001 — Identidad operativa del paciente y semántica mínima de `Patient.identifier`

> Estado: aceptada para trabajo incremental
> Fecha: 2026-04-22 (UTC)
> Alcance: `Patient.identifier`, DNI, gate operativo de inicio de tratamiento

## Contexto

La auditoría técnica detectó que el repo usa DNI como identificador operativo central para el paciente, con búsqueda por `identifier=system|value`, pero sin semántica adicional suficiente (`Identifier.type`) y sin un documento explícito que declare el criterio de negocio y sus límites.

Además, hoy no existe soporte real para:

- verificación de identidad externa;
- integración con RENAPER;
- múltiples identificadores equivalentes;
- abstracción de “identidad validada” separada de DNI.

## Decisión

### 1. Regla operativa vigente

Se mantiene **DNI como requisito operativo actual** para iniciar `EpisodeOfCare`.

Esto se acepta como decisión transicional de negocio y producto, no como diseño final universal.

### 2. Semántica mínima de `Patient.identifier`

El modelado mínimo esperado para DNI en FHIR pasa a ser:

- `identifier.system`: namespace estable del identificador;
- `identifier.value`: valor del DNI;
- `identifier.type`: obligatorio en la próxima fase de enriquecimiento semántico.

### 3. Qué no se modela todavía

Queda explícitamente fuera de alcance actual:

- procedencia/verificación RENAPER;
- score o nivel de confianza de identidad;
- historial de validaciones;
- múltiples documentos con prioridad/reemplazo;
- lógica de identidad federada o MPI.

## Rationale

- Mantener DNI como gate evita abrir una refactorización de reglas de negocio en el corto plazo.
- Incorporar `Identifier.type` mejora semántica con costo técnico bajo.
- No introducir todavía metadatos de verificación evita inventar semántica no soportada por el producto real.

## Consecuencias

### Positivas

- se explicita una regla ya existente en código;
- baja la ambigüedad para próximos tickets;
- se puede enriquecer `identifier` sin romper búsqueda ni flujos actuales.

### Negativas / deuda aceptada

- el flujo sigue rígido para pacientes sin DNI disponible;
- la identidad sigue acoplada a una única estrategia operativa;
- la evolución futura requerirá revisión explícita de esta ADR.

## Triggers de revisión

Reabrir esta ADR si ocurre cualquiera de estos casos:

1. el producto necesita operar con otro identificador además de DNI;
2. se incorpora validación externa de identidad;
3. se requiere distinguir identidad declarada vs validada;
4. se expande el flujo a instituciones, cobertura, o población sin DNI operativo.
