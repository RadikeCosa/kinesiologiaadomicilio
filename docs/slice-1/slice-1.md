# Slice 1 — alta flexible de paciente + identidad mínima para iniciar tratamiento

> Estado del documento: cierre de Slice 1 alineado a implementación real
> Última actualización: 2026-04-17 (UTC)

## 1) Encadre del slice

Este slice implementa una **primera superficie privada mínima** bajo `/admin/patients` sin cambiar el rol principal de la landing pública.

El objetivo fue habilitar un flujo clínico inicial útil y chico, con alcance acotado pre-Encounter.

## 2) Objetivo funcional (intención original)

Permitir que el profesional pueda:

- crear ficha preliminar de paciente con fricción mínima;
- completar datos más adelante;
- separar “crear paciente” de “iniciar tratamiento”;
- separar también la finalización de tratamiento como acción explícita;
- exigir identidad mínima (DNI) al iniciar tratamiento;
- bloquear inicio de tratamiento si hay duplicado simple por DNI.

## 3) Estado implementado real del Slice 1

### 3.1 Rutas privadas implementadas

- `/admin/patients`
- `/admin/patients/new`
- `/admin/patients/[id]`

### 3.2 Capacidades implementadas

- listado mínimo de pacientes;
- alta mínima de paciente;
- detalle de paciente;
- edición incremental de ficha;
- inicio de tratamiento como acción separada;
- finalización de tratamiento cerrando el episodio activo;
- validación de DNI para iniciar tratamiento;
- bloqueo simple por duplicado de DNI al iniciar tratamiento;
- consistencia de estado operativo entre listado y detalle para tratamiento activo/finalizado/sin tratamiento;
- loaders mínimos de listado y detalle;
- tests iniciales de dominio e integración del slice.

### 3.3 Estado técnico de implementación

- `Patient` persiste y lee desde FHIR real vía repository + mapper.
- `EpisodeOfCare` persiste y lee desde FHIR real vía repository + mapper.
- El slice mantiene alcance mínimo operativo (no es aún flujo clínico completo).

## 4) Reglas de negocio aplicadas

### Regla A — alta mínima

Se puede crear paciente con:

- nombre
- apellido

El resto se completa después.

### Regla B — apertura de tratamiento

No se puede iniciar tratamiento si:

- falta DNI en la ficha;
- existe otra ficha con el mismo DNI;
- el paciente ya tiene episodio activo.

### Regla C — no apertura automática

Crear paciente **no** inicia tratamiento automáticamente.

### Regla D — tolerancia a ficha preliminar

Se admiten fichas incompletas sin forzar completitud total temprana.

## 5) Componentes técnicos realmente presentes en el slice

### 5.1 Acciones

- `create-patient.action.ts`
- `update-patient.action.ts`
- `start-episode-of-care.action.ts`
- `finish-episode-of-care.action.ts`

### 5.2 Lectura (loaders)

- `src/app/admin/patients/data.ts` (`loadPatientsList`)
- `src/app/admin/patients/[id]/data.ts` (`loadPatientDetail`)

### 5.3 UI mínima

- `PatientCreateForm`
- `PatientDetailView`
- `PatientEditForm`
- `StartEpisodeOfCareForm`
- `FinishEpisodeOfCareForm`

### 5.4 Dominio y validación

- `domain/patient`: types, rules, schemas, constants
- `domain/episode-of-care`: types, rules, schemas

### 5.5 Tests iniciales del slice

- unit tests de rules/schemas (patient + episode-of-care)
- integration tests de actions y data loaders de `/admin/patients`

## 6) Criterio de cierre del slice (estado alcanzado)

El Slice 1 se considera **cerrado a nivel transicional** porque:

- existen las tres rutas privadas mínimas;
- alta mínima funciona con nombre + apellido;
- edición incremental está disponible;
- inicio de tratamiento está separado del alta;
- se exige DNI para iniciar tratamiento;
- se bloquea inicio con duplicado simple de DNI;
- listado y detalle mínimos están operativos;
- hay tests iniciales del slice;
- documentación operativa global y de slice quedó alineada al estado real.

## 7) Fuera de alcance (se mantiene vigente)

- encounters / visitas;
- historial longitudinal;
- auth;
- persistencia productiva;
- agenda;
- pagos;
- `/portal`;
- multiusuario;
- deduplicación avanzada;

## 8) Remanente real post-Slice 1 (sin inflar roadmap)

- endurecer comportamiento para contexto productivo (incluyendo auth cuando corresponda);
- recién después, evaluar slices que incorporen encounters e historial longitudinal.

## 9) Nota de uso documental

Este documento conserva el encuadre y decisiones del Slice 1, pero prioriza el **estado implementado real**.

Para estado global del repo (landing + superficie privada mínima), usar junto con:

- `docs/fuente-de-verdad-operativa.md`
- `.github/copilot-instructions.md`
