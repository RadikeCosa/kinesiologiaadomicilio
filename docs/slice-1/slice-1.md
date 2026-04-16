# Slice 1 — alta flexible de paciente + identidad mínima para iniciar tratamiento

Este slice queda alineado con la dirección documentada: la landing pública sigue igual, y la nueva app clínica entra como superficie privada bajo `/admin`, empezando por pacientes y tratamiento activo, sin abrir todavía agenda, pagos, portal ni multiusuario.

## 1) Objetivo del slice

Permitir que el profesional pueda:

- crear una ficha preliminar de paciente con fricción mínima;
- completar datos más adelante;
- distinguir pacientes sin tratamiento iniciado de pacientes con tratamiento activo;
- exigir una identidad mínima confiable antes de abrir un EpisodeOfCare;
- evitar duplicados operativos al momento de iniciar tratamiento usando DNI como criterio mínimo.

## 2) Principio rector

Crear paciente y comenzar tratamiento no son la misma operación.

En este slice:

- se puede crear un paciente con solo nombre y apellido;
- no se abre tratamiento automáticamente;
- para abrir tratamiento, el paciente debe tener DNI;
- si el DNI ya existe en otra ficha, no se puede iniciar tratamiento sin resolver el conflicto.

Esto respeta mejor el flujo real de trabajo y evita forzar fichas “completas” demasiado temprano.

## 3) Alcance funcional incluido

### Incluido

- listado de pacientes;
- alta mínima de paciente;
- detalle de paciente;
- edición incremental de ficha;
- registro opcional de contacto principal;
- registro opcional de contexto inicial;
- nota operativa opcional;
- acción separada para iniciar tratamiento;
- validación de DNI para apertura de EpisodeOfCare;
- prevención mínima de duplicados basada en DNI al iniciar tratamiento.

### Explícitamente fuera de alcance

- encounters / visitas;
- historial clínico longitudinal;
- agenda;
- pagos;
- `/portal`;
- auth compleja;
- multiusuario;
- deduplicación avanzada por heurísticas;
- cierre formal de tratamiento;
- panel administrativo amplio.

## 4) Rutas del slice

Siguiendo la arquitectura objetivo documentada para la app privada:

`/admin/patients`

`/admin/patients/new`

`/admin/patients/[id]`

Opcional dentro del mismo slice, según preferencia de UI:

- edición embebida en `/admin/patients/[id]`
- o subruta futura `/admin/patients/[id]/edit`

Para este primer slice, yo prefiero edición dentro del detalle para no abrir más superficie de la necesaria.

## 5) Modelo funcional mínimo del slice

### Patient

Campos mínimos propuestos:

#### Requeridos al crear

`firstName`

`lastName`

#### Opcionales

`dni`

`phone`

`birthDate`

`address`

`notes`

### MainContact

Opcional, un único contacto principal inicial:

`name`

`relationship`

`phone`

`notes`

### InitialContext

Opcional:

`reasonForConsultation`

`requestedBy`

`initialNotes`

### EpisodeOfCare

No se crea en el alta mínima.

Solo aparece cuando se ejecuta la acción de iniciar tratamiento.

Campos mínimos al iniciar:

`patientId`

`status = active`

`startDate`

`description o diagnosticSummary opcional`

## 6) Regla de negocio principal

### Regla A — alta mínima

Se puede crear un paciente con:

- nombre
- apellido

Todo lo demás puede completarse después.

### Regla B — apertura de tratamiento

No se puede abrir unEpisodeOfCare si:

- el paciente no tiene DNI;
- o existe otra ficha con el mismo DNI.

### Regla C — no apertura automática

Crear paciente no abre tratamiento automáticamente.

### Regla D — tolerancia a fichas preliminares

El sistema debe permitir fichas incompletas y pacientes que finalmente nunca inicien tratamiento.

## 7) Estados operativos del caso

No hace falta persistir una máquina de estados formal en este slice. Se pueden derivar desde los datos.

### Estado derivado 1 — ficha preliminar

Paciente creado con nombre y apellido, pero sin DNI.

### Estado derivado 2 — listo para iniciar tratamiento

Paciente con DNI, pero sin EpisodeOfCare activo.

### Estado derivado 3 — tratamiento activo

Paciente con EpisodeOfCare activo.

Esto te simplifica bastante la UI y el listado.

## 8) Read models mínimos

### A. PatientsListItem

Para `/admin/patients`

`id`

`fullName`

`dni opcional`

`phone opcional`

`operationalStatus`

`preliminary`

`ready_to_start`

`active_treatment`

`createdAt`

`updatedAt`

### B. PatientDetailReadModel

Para `/admin/patients/[id]`

`id`

`fullName`

`dni`

`phone`

`birthDate`

`address`

`patientNotes`

`mainContact`

`initialContext`

`activeEpisode o null`

`operationalStatus`

`createdAt`

`updatedAt`

Clave importante: el detalle debe renderizar bien aunque no exista EpisodeOfCare.

## 9) Acciones del slice

Siguiendo la arquitectura objetivo de escritura documentada: UI Form -> Server Action -> Zod -> Domain Rules -> Repository -> Mapper -> FHIR.

### A. createPatientAction

Responsabilidad:

- crear ficha preliminar mínima.

Entrada:

- nombre
- apellido
- opcionales básicos

Validación:

- nombre requerido
- apellido requerido
- resto opcional

Resultado:

- paciente creado
- sin tratamiento iniciado

### B. updatePatientAction

Responsabilidad:

- completar o editar datos de la ficha.

Entrada:

- campos editables del paciente
- contacto principal opcional
- contexto inicial opcional

Validación:

- no romper si faltan campos no obligatorios
- validar formato de DNI si está presente
- validar formato básico de teléfono si está presente

Resultado:

- ficha actualizada

### C. startEpisodeOfCareAction

Responsabilidad:

- abrir tratamiento activo.

Entrada:

- patientId
- startDate
- description opcional

Validación:

- paciente existe
- paciente tiene DNI
- no hay otro paciente con el mismo DNI
- el paciente no tiene ya un episodio activo

Resultado:

- EpisodeOfCare activo creado

## 10) Validaciones mínimas por formulario

### Formulario de alta mínima

Requeridos:

- nombre
- apellido

Opcionales:

- DNI
- teléfono
- fecha de nacimiento
- dirección
- nota operativa

### Formulario de edición

Todos opcionales excepto integridad mínima de campos enviados.

### Acción de iniciar tratamiento

Requeridos:

- DNI ya cargado en ficha
- fecha de inicio

Opcional:

- descripción breve

## 11) Duplicados: estrategia mínima del slice

No intentaría resolver duplicados por nombre/apellido.

### Regla operativa

- se permiten fichas preliminares parecidas;
- el control fuerte aparece al usar DNI.

### Comportamiento

- si el paciente no tiene DNI, se puede guardar igual;
- si se intenta iniciar tratamiento sin DNI, se bloquea;
- si el DNI coincide con otro paciente, se bloquea la apertura del episodio.

### Mensaje sugerido

“Ya existe otra ficha con ese DNI. Revisá si corresponde continuar con el paciente existente antes de iniciar tratamiento.”

## 12) Diseño de UI mínimo

`/admin/patients`

Listado simple con:

- nombre
- DNI o “sin DNI”
- teléfono si existe
- estado operativo
- acción “Ver”

Y arriba:

- botón “Nuevo paciente”

`/admin/patients/new`

Formulario corto.

Ideal para este slice:

- vista simple, sin intentar resolver toda la ficha en una sola pantalla.

`/admin/patients/[id]`

Bloques sugeridos:

- identidad
- contacto principal
- contexto inicial
- nota operativa
- tratamiento

Señales visibles

Si no tiene DNI:

“Identidad incompleta”

“Para iniciar tratamiento, completá el DNI”

Si tiene DNI y no tiene episodio:

“Listo para iniciar tratamiento”

Si tiene episodio activo:

“Tratamiento activo”

## 13) Arquitectura de carpetas sugerida para el slice

Aterrizada sobre la estructura objetivo ya documentada:

```text
src/
  app/
    admin/
      patients/
        page.tsx
        data.ts
        actions/
          create-patient.action.ts
        new/
          page.tsx
          PatientCreateForm.tsx
        [id]/
          page.tsx
          data.ts
          actions/
            update-patient.action.ts
            start-episode-of-care.action.ts
          PatientDetailView.tsx
          PatientEditForm.tsx
          StartEpisodeForm.tsx

  domain/
    patient/
      patient.types.ts
      patient.rules.ts
    episode-of-care/
      episode-of-care.types.ts
      episode-of-care.rules.ts

  infrastructure/
    repositories/
      patient.repository.ts
      episode-of-care.repository.ts
    mappers/
      patient/
      episode-of-care/

  lib/
    fhir/
      client.ts
```

## 14) Decisión importante sobre FHIR en este slice

Dado lo documentado, conviene mantener la regla desde el inicio:

- la UI no ve FHIR crudo;
- los loaders devuelven read models;
- las actions no construyen payloads FHIR en componentes;
- el mapeo queda en infraestructura.

Aunque el slice sea chico, esta frontera vale la pena cuidarla desde el primer commit.

## 15) Testing mínimo recomendado

La estrategia de testing documentada ya dice que no conviene esperar al final y que al principio hay que cubrir la lógica crítica a medida que aparece.

`patient.rules`
`episode-of-care.rules`
`validación de DNI`
`mappers de paciente`
`mappers de episodio`
`Integration tests`
`createPatientAction`
`updatePatientAction`
`startEpisodeOfCareAction`
`loaders de listado y detalle`
`E2E mínimo`

Cuando el slice ya esté estable:

- crear paciente con nombre y apellido
- completar DNI
- iniciar tratamiento
- verificar estado en detalle y/o listado

## 16) Criterio de done del slice

El slice puede considerarse cerrado cuando:

- existe `/admin/patients`;
- existe `/admin/patients/new`;
- existe `/admin/patients/[id]`;
- se puede crear paciente con solo nombre y apellido;
- se pueden completar datos después;
- el detalle soporta pacientes sin tratamiento;
- iniciar tratamiento es una acción separada;
- el sistema exige DNI para abrir EpisodeOfCare;
- el sistema bloquea apertura de tratamiento con DNI duplicado;
- hay tests mínimos de reglas, actions y loaders;
- la documentación operativa del repo se actualiza para reflejar el nuevo estado real cuando el slice ya esté implementado.

## 17) Orden recomendado de implementación

- Documento del slice.
- Skeleton de rutas `/admin/patients`.
- Tipos y reglas de dominio mínimas.
- Read models de listado y detalle.
- createPatientAction.
- UI de alta mínima.
- updatePatientAction.
- UI de edición incremental.
- startEpisodeOfCareAction.
- UI para iniciar tratamiento.
- Tests.
- Ajuste documental final.

## 18) Riesgos a vigilar

### Riesgo 1 — mezclar alta con tratamiento

Evitar que el alta mínima vuelva a acoplarse con apertura automática de episodio.

### Riesgo 2 — endurecer demasiado la ficha

Si pedís demasiados campos al inicio, perdés el valor principal del slice.

### Riesgo 3 — usar DNI como deduplicación “total”

En este slice está bien como control mínimo operativo, pero no hay que venderlo como deduplicación perfecta.

### Riesgo 4 — hacer depender todo del episodio

El detalle del paciente debe existir aunque no haya tratamiento.

Decisiones cerradas del Slice 1
Crear paciente requiere solo nombre y apellido.
El resto de los datos puede completarse más adelante.
Crear paciente no abre tratamiento automáticamente.
Para iniciar EpisodeOfCare, el paciente debe tener DNI.
No se puede iniciar tratamiento si ese DNI ya existe en otra ficha.
El sistema debe soportar pacientes que nunca inician tratamiento.
Mi recomendación de implementación inmediata

Yo arrancaría con este primer sub-hito:

Sub-hito A

`/admin/patients`
`/admin/patients/new`
`createPatientAction`
listado + alta mínima

Y después:

Sub-hito B

`/admin/patients/[id]`
`updatePatientAction`
`startEpisodeOfCareAction`
