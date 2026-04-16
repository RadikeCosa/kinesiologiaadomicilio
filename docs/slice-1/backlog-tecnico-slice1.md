# Fase 1 — Estructura de carpetas y naming base

**Objetivo:** crear el esqueleto del slice antes de implementar lógica.

### Naming recomendado

Mantendría naming explícito, sin abreviaturas raras:

- patient
- episode-of-care
- create-patient.action.ts
- update-patient.action.ts
- start-episode-of-care.action.ts
- patient-list-item.read-model.ts
- patient-detail.read-model.ts

### Estructura propuesta

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
          components/
            PatientCreateForm.tsx
        [id]/
          page.tsx
          data.ts
          actions/
            update-patient.action.ts
            start-episode-of-care.action.ts
          components/
            PatientDetailView.tsx
            PatientEditForm.tsx
            StartEpisodeOfCareForm.tsx

  domain/
    patient/
      patient.types.ts
      patient.rules.ts
      patient.schemas.ts
      patient.constants.ts
    episode-of-care/
      episode-of-care.types.ts
      episode-of-care.rules.ts
      episode-of-care.schemas.ts

  infrastructure/
    repositories/
      patient.repository.ts
      episode-of-care.repository.ts
    mappers/
      patient/
        patient-read.mapper.ts
        patient-write.mapper.ts
      episode-of-care/
        episode-of-care-read.mapper.ts
        episode-of-care-write.mapper.ts

  lib/
    fhir/
      client.ts
      resource-types.ts

  features/
    patients/
      read-models/
        patient-list-item.read-model.ts
        patient-detail.read-model.ts
```

### Decisiones de naming

- `domain/` guarda tipos, reglas y schemas de negocio.
- `infrastructure/` guarda repositorios y mappers FHIR.
- `app/admin/...` guarda orquestación de rutas, loaders y acciones route-local.
- `features/patients/read-models/` puede usarse para read models compartidos entre listado y detalle sin meterlos en `domain`, porque no son dominio puro.

### Criterio de done

- Carpetas creadas.
- Archivos placeholder creados con exports mínimos.
- Sin lógica todavía.
- El naming queda fijado y consistente.

# Fase 2 — Contratos mínimos del dominio

**Objetivo:** fijar los tipos base antes de UI y persistencia.

### Tareas

Crear tipos mínimos:

- `domain/patient/patient.types.ts`
  - Patient
  - PatientIdentity
  - MainContact
  - InitialContext
  - PatientOperationalStatus
- `domain/episode-of-care/episode-of-care.types.ts`
  - EpisodeOfCare
  - EpisodeOfCareStatus

### Modelo mínimo sugerido

**Patient**

- id
- firstName
- lastName
- dni?
- phone?
- birthDate?
- address?
- notes?
- mainContact?
- initialContext?
- createdAt
- updatedAt

**EpisodeOfCare**

- id
- patientId
- status
- startDate
- description?

### Criterio de done

- Tipos creados.
- Sin dependencia de React/UI.
- Sin shapes FHIR crudos expuestos.

# Fase 3 — Reglas de negocio mínimas

**Objetivo:** capturar reglas centrales del slice antes de escribir acciones.

### Tareas

- `domain/patient/patient.rules.ts`
  - canCreatePatient(input)
  - canUpdatePatient(input)
  - hasRequiredIdentityForEpisode(patient) → exige DNI
- `domain/episode-of-care/episode-of-care.rules.ts`
  - canStartEpisodeOfCare(patient, existingActiveEpisode, duplicateByDni)

### Reglas a codificar

- crear paciente requiere nombre + apellido;
- iniciar episodio requiere DNI;
- no se inicia episodio si ya hay episodio activo;
- no se inicia episodio si el DNI coincide con otra ficha.

### Criterio de done

- Reglas puras.
- Sin acceso a DB/FHIR.
- Mensajes de error claros.

# Fase 4 — Schemas de validación

**Objetivo:** separar shape validation de las reglas de negocio.

### Tareas

- `domain/patient/patient.schemas.ts`
  - createPatientSchema
  - updatePatientSchema
- `domain/episode-of-care/episode-of-care.schemas.ts`
  - startEpisodeOfCareSchema

### Validaciones

- firstName: requerido
- lastName: requerido
- dni: opcional al crear/editar, requerido solo en start episode
- teléfono opcional
- campos de contacto/contexto opcionales

### Criterio de done

- Schemas listos para server actions.
- Validación de formato, no de reglas de negocio complejas.

# Fase 5 — Read models

**Objetivo:** fijar la forma en que la UI va a consumir datos.

### Tareas

- `features/patients/read-models/patient-list-item.read-model.ts`
  - PatientListItemReadModel
- `features/patients/read-models/patient-detail.read-model.ts`
  - PatientDetailReadModel

### Campos mínimos

**Listado**

- id
- fullName
- dni
- phone
- operationalStatus
- createdAt
- updatedAt

**Detalle**

- identidad completa
- contacto principal
- contexto inicial
- nota operativa
- activeEpisode
- operationalStatus

### Criterio de done

- Read models definidos.
- UI no necesita conocer recursos FHIR.

# Fase 6 — Repositorios y mappers base

**Objetivo:** preparar infraestructura antes de acciones reales.

### Tareas

- `infrastructure/repositories/patient.repository.ts`
  - createPatient
  - getPatientById
  - listPatients
  - updatePatient
  - findPatientByDni
- `infrastructure/repositories/episode-of-care.repository.ts`
  - getActiveEpisodeByPatientId
  - createEpisodeOfCare
- `infrastructure/mappers/...`
  - mapear desde/hacia FHIR
  - mapear recursos a read models / dominio

### Decisión importante

Aunque al principio haya placeholders o implementación parcial, mantener desde el inicio:

- repository como frontera;
- mapper como lugar del acople FHIR;
- nada de payload FHIR armado en componentes o en page.tsx.

### Criterio de done

- Interfaces claras.
- Implementación inicial aunque sea mínima.
- Sin mezclar infraestructura con UI.

# Fase 7 — Loaders de rutas

**Objetivo:** conectar lectura a las rutas.

### Tareas

- `src/app/admin/patients/data.ts`
  - loadPatientsList()
- `src/app/admin/patients/[id]/data.ts`
  - loadPatientDetail(patientId)

### Criterio de done

- `page.tsx` consume loaders.
- No compone datos en JSX.
- Detalle soporta ausencia de episodio.

# Fase 8 — Server actions

**Objetivo:** habilitar escritura mínima del slice.

### Tareas

- `create-patient.action.ts`
  - usa createPatientSchema
  - aplica reglas de creación
  - persiste paciente
- `update-patient.action.ts`
  - usa updatePatientSchema
  - actualiza campos editables
  - permite completar DNI más tarde
- `start-episode-of-care.action.ts`
  - usa startEpisodeOfCareSchema
  - obtiene paciente
  - valida DNI
  - busca duplicado por DNI
  - valida episodio activo inexistente
  - crea EpisodeOfCare

### Criterio de done

- Actions chicas, con responsabilidades claras.
- Validación de shape + reglas + persistencia separadas.

# Fase 9 — UI mínima

**Objetivo:** hacer usable el slice sin sobre-diseñar.

### Tareas

- `/admin/patients/page.tsx`
  - listado simple
  - botón “Nuevo paciente”
- `/admin/patients/new/page.tsx`
  - PatientCreateForm
  - solo alta mínima y algunos opcionales
- `/admin/patients/[id]/page.tsx`
  - PatientDetailView
  - PatientEditForm
  - StartEpisodeOfCareForm

### Señales de estado

- sin DNI → “Identidad incompleta”
- con DNI y sin episodio → “Listo para iniciar tratamiento”
- con episodio activo → “Tratamiento activo”

### Criterio de done

- Flujo visible de punta a punta.
- Sin depender todavía de encounters.

# Fase 10 — Tests

**Objetivo:** cubrir lo crítico del slice.

### Unit

- schemas
- patient.rules
- episode-of-care.rules

### Integration

- createPatientAction
- updatePatientAction
- startEpisodeOfCareAction
- loaders

### E2E mínimo posterior

- crear paciente
- completar DNI
- iniciar tratamiento

### Criterio de done

- Cobertura de la lógica crítica, no maquillaje de tests.

# Fase 11 — Documentación de cierre

**Objetivo:** evitar drift documental.

### Tareas

Actualizar cuando el slice esté realmente implementado:

- `docs/fuente-de-verdad-operativa.md`
- eventualmente nuevo apartado de app privada
- cualquier guía interna afectada

Esto ya está alineado con la instrucción de mantener la documentación consistente con el estado real.

### Orden recomendado de ejecución real

**Sub-hito A**

- Fase 1: estructura y naming
- Fase 2: tipos
- Fase 3: reglas
- Fase 4: schemas

**Sub-hito B**

- Fase 5: read models
- Fase 6: repositorios y mappers
- Fase 7: loaders

**Sub-hito C**

- Fase 8: actions
- Fase 9: UI

**Sub-hito D**

- Fase 10: tests
- Fase 11: documentación

### Checklist operativo corto

**Estructura**

- `src/app/admin/patients` creada
- `src/domain/patient` creado
- `src/domain/episode-of-care` creado
- `src/infrastructure/repositories` creado
- `src/infrastructure/mappers` creado

**Contratos**

- tipos mínimos de paciente
- tipos mínimos de episodio
- estados operativos derivados

**Reglas**

- alta mínima con nombre y apellido
- DNI obligatorio para iniciar tratamiento
- bloqueo por DNI duplicado
- bloqueo si ya hay episodio activo

**Escritura**

- createPatientAction
- updatePatientAction
- startEpisodeOfCareAction

**Lectura**

- listado de pacientes
- detalle de paciente
- detalle soporta ausencia de episodio

**UI**

- alta mínima
- edición incremental
- inicio de tratamiento separado

**Calidad**

- unit tests
- integration tests
- documentación actualizada

### Arranque de ejecución

Sí: el primer paso correcto es crear la estructura de carpetas y fijar el naming.

No puedo crearla todavía desde acá porque en este entorno solo tengo disponibles los documentos que subiste y no el árbol real del repositorio para modificarlo. Lo que sí ya te dejo cerrado es el primer paquete de ejecución:

**Primer paquete a implementar**

- `src/app/admin/patients/...`
- `src/domain/patient/...`
- `src/domain/episode-of-care/...`
- `src/infrastructure/repositories/...`
- `src/infrastructure/mappers/...`
- placeholders con exports mínimos
- sin lógica todavía

Después de eso, el segundo paquete sería tipos + reglas + schemas.