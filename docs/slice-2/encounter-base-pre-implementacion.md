# Slice 2 — Encounter base (pre-implementación, v2)

> Estado: documento histórico de diseño pre-implementación (slice implementado)
> Fecha: 2026-04-17 (UTC)
> Documento de cierre implementado: `docs/slice-2/slice-2-encounter-base-cierre.md`

## A. Propósito

Definir un slice **chico, implementable y verificable** para abrir Encounter sobre la base ya establecida en el repo (`Patient` + `EpisodeOfCare` en FHIR real), sin abrir todavía complejidad clínica adicional.

Esta versión v2 cierra las decisiones mínimas necesarias para reducir ambigüedad antes de implementar.

## B. Estado de partida (real del repo)

- Rutas privadas implementadas hoy:
  - `/admin/patients`
  - `/admin/patients/new`
  - `/admin/patients/[id]`
- Escritura vigente vía server actions:
  - crear paciente
  - editar paciente
  - iniciar tratamiento (`EpisodeOfCare` activo)
  - finalizar tratamiento (`EpisodeOfCare` finished)
- Lectura vigente vía loaders route-locales:
  - listado de pacientes
  - detalle de paciente con composición de estado operativo
- Dominio implementado: `patient` y `episode-of-care`.
- Infraestructura FHIR activa: repositorios + mappers para `Patient` y `EpisodeOfCare`.
- Límite actual explícito en docs: estado pre-Encounter.

Conclusión: el patrón técnico está consolidado y listo para replicarse en Encounter base, pero Encounter todavía no existe en código.

## C. Objetivo del slice

Habilitar una capacidad mínima concreta:

- **registrar visitas realizadas** de un paciente (Encounter base),
- **listar esas visitas** en una superficie privada acotada por paciente,
- manteniendo coherencia con el tratamiento activo (`EpisodeOfCare`).

## D. Decisiones cerradas del slice (v2)

### D.1 Semántica de Encounter base (cerrada)

En este slice, Encounter representa:

- **un registro simple de visita ya realizada**,
- no un flujo de visita en curso con múltiples estados operativos.

Implicancia:

- el slice no modela ciclo de vida complejo de la visita;
- el foco es registrar y consultar encuentros básicos vinculados al tratamiento.

### D.2 Gate con EpisodeOfCare (cerrado)

Para crear Encounter base **se exige EpisodeOfCare activo** del paciente.

Regla operativa:

- sin episodio activo, no se crea Encounter;
- el action debe devolver error de negocio explícito y legible.

Motivo de cierre:

- el repo ya usa `EpisodeOfCare` como marco de tratamiento activo/finalizado;
- este gate reduce ambigüedad semántica y evita crear visitas huérfanas en esta etapa.

### D.3 Campos mínimos de Encounter base (cerrados)

Modelo mínimo propuesto para esta etapa:

- `id`
- `patientId`
- `episodeOfCareId`
- `occurrenceDate` (fecha/hora de visita realizada)
- `status` (fijado en `"finished"` para este slice base)

Convención FHIR cerrada para este slice:

- `occurrenceDate` de dominio se persiste en `Encounter.period`;
- `Encounter.period.start = occurrenceDate`;
- `Encounter.period.end = occurrenceDate`;
- `Encounter.status = "finished"`.

Justificación de la convención:

- Encounter base representa visita ya realizada;
- no se abre aún modelado temporal más rico;
- no se abren estados intermedios ni ciclo de vida complejo;
- se mantiene una base simple y compatible para evolución futura.

### D.4 Superficie exacta que entra (cerrada)

Entra en este slice:

- **`/admin/patients/[id]/encounters`** (listado básico + alta simple de Encounter base).

No entra en este slice:

- **`/admin/patients/[id]/encounters/[encounterId]`**.

## E. Alcance explícito

Incluye solo lo necesario para la capacidad definida:

1. **Ruta privada base de encounters por paciente**
   - `page.tsx` de orquestación
   - `data.ts` para lectura mínima
   - componentes route-locales mínimos

2. **Escritura mínima**
   - una server action para registrar Encounter base
   - validación de input (schema)
   - regla de negocio con gate de episodio activo

3. **Dominio Encounter mínimo**
   - `encounter.types.ts`
   - `encounter.schemas.ts`
   - `encounter.rules.ts`

4. **Infraestructura Encounter mínima**
   - `encounter.repository.ts`
   - mappers read/write de Encounter
   - tipos FHIR mínimos de Encounter
   - search params mínimos para consulta por paciente

5. **FHIR común reutilizado**
   - mantener `fhirClient`, `bundle-utils`, `errors`, `references`
   - extender `resource-types.ts` para incluir `Encounter`

6. **Tests mínimos del slice**
   - unit: schemas/rules/mappers encounter
   - integration: action + data + repository encounter

7. **Documentación alineada al cierre**
   - actualización de docs operativas/slice según estado real implementado (cuando corresponda en el cierre del slice)

## F. Fuera de alcance explícito (tajante)

Queda fuera de Encounter base:

- `Observation`
- `Procedure`
- detalle rico de Encounter
- edición compleja de encounter
- flujos save/finalize complejos de visita
- múltiples estados operativos de visita en curso
- historial longitudinal complejo
- `_include` / `_revinclude` complejos
- bundles transaccionales
- auth, agenda, pagos, `/portal`, multiusuario
- refactors grandes transversales no imprescindibles para este slice

## G. Estrategia esperada de lectura y escritura

Se mantiene el patrón vigente del repo (sin introducir arquitectura nueva):

- **Lectura**
  `FHIR -> fhirClient -> repository -> mapper -> domain/read model -> data.ts -> UI`

- **Escritura**
  `UI form -> server action -> schema -> domain rules -> repository -> write mapper -> fhirClient -> FHIR`

Convención de escritura Encounter base:

- mapear `occurrenceDate` a `Encounter.period`;
- setear `Encounter.period.start = occurrenceDate`;
- setear `Encounter.period.end = occurrenceDate`;
- persistir `Encounter.status = "finished"`.

Criterios:

- no exponer FHIR crudo en UI;
- sostener composición en `data.ts`;
- sostener contrato simple de actions (`ok`, `message`);
- no incorporar abstracciones nuevas si el patrón actual ya alcanza.

## H. Riesgos o deudas aceptadas

1. **Concurrencia optimista**
   - se mantiene fuera (`If-Match`/versionado), como en bloques actuales.

2. **Búsqueda/paginación avanzada**
   - no se abre en Encounter base; consulta acotada por paciente.

3. **Semántica clínica limitada intencionalmente**
   - Encounter base no pretende cubrir registro clínico longitudinal completo.

4. **Convención temporal/status simplificada**
   - usar `period.start/end` iguales y `status="finished"` simplifica este slice, pero no modela variaciones temporales reales de visitas futuras.

5. **Dependencia de consistencia con EpisodeOfCare**
   - el gate de episodio activo obliga a mantener clara la lectura del estado activo/finalizado en Patient detail/listado.

## I. Criterio de cierre operativo del slice

Encounter base se considera cerrado cuando exista todo lo siguiente funcionando:

1. Ruta **`/admin/patients/[id]/encounters`** disponible y renderizando:
   - listado básico de encounters del paciente,
   - formulario simple para registrar visita realizada.

2. Server action de creación de Encounter base funcionando con:
   - validación de schema,
   - regla de negocio “requiere episodio activo”,
   - mensajes de error/éxito explícitos.

3. Persistencia/lectura FHIR de Encounter operativa mediante:
   - repository,
   - mapper de escritura,
   - mapper de lectura,
   - search por paciente.

   Convención mínima verificada en implementación:
   - `Encounter.period.start = occurrenceDate`;
   - `Encounter.period.end = occurrenceDate`;
   - `Encounter.status = "finished"`.

4. Dominio Encounter mínimo definido y usado por action/data/repository.

5. Cobertura mínima de tests del slice:
   - unit tests de schema/rules/mappers,
   - integration tests de action/data/repository.

6. Sin desvíos de alcance:
   - no se implementó `Observation` ni `Procedure`,
   - no se abrió detalle rico ni longitudinal complejo,
   - no se agregaron refactors grandes no necesarios.

7. Documentación actualizada al estado real alcanzado del slice.

---

## Nota de encuadre

Este documento no describe Encounter como ya implementado.

Define el alcance cerrado de pre-implementación para que el próximo paso (prompts de implementación) tenga menor ambigüedad y riesgo de scope creep.
