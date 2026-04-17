# Paso 1 — decisiones finales y alineación del modelo vigente

**Estado:** propuesto para ejecución inmediata

**Objetivo:** cerrar decisiones de diseño previas a la integración FHIR y alinear el código actual al modelo simplificado antes de reemplazar persistencia in-memory.

## 1) Propósito

Antes de arrancar la integración con el servidor FHIR, este paso busca cerrar decisiones de diseño que afectan al modelo clínico mínimo vigente y evitar migrar a FHIR con conceptos que ya fueron descartados.

La intención es simple:

- reducir ambigüedad del modelo,
- bajar complejidad innecesaria en la futura capa FHIR,
- y limpiar el código actual antes de reemplazar repositorios in-memory por persistencia real.

Este paso no abre funcionalidad nueva. Es un paso de consolidación y saneamiento previo.

## 2) Decisiones finales cerradas

### 2.1 Se elimina initialContext del modelo

initialContext deja de formar parte del modelo vigente y también queda fuera del diseño de integración FHIR de esta etapa.

#### Justificación

Se considera redundante respecto de dos superficies ya suficientes para resolver contexto libre inicial:

- notas generales del paciente
- descripción breve del tratamiento (EpisodeOfCare)

Mantener initialContext implicaría sostener un tercer lugar semánticamente cercano para texto/contexto libre, aumentando ambigüedad en UI, dominio, validación y mapeo FHIR.

#### Efecto arquitectónico

- no se incorporan extensiones FHIR custom para este frente;
- no se sostienen campos intermedios “por si acaso”;
- no se migra a FHIR un concepto que ya no se quiere conservar.

### 2.2 El contexto libre inicial se resuelve con dos campos existentes

A partir de esta decisión, el contexto textual libre relevante queda distribuido así:

- notas generales del paciente: contexto general y observaciones persistentes del caso
- descripción breve del tratamiento / episodio: motivo o marco breve del tratamiento activo

No se define un tercer contenedor específico para “contexto inicial”.

### 2.3 Política de note para la futura integración FHIR

Aunque en esta etapa todavía no se implementa FHIR real, se deja cerrada la decisión conceptual:

- Patient.note podrá usarse para notas generales del paciente
- EpisodeOfCare.note podrá usarse para descripción breve del tratamiento

Pero no se asumirá semánticamente que note[0] es siempre “la nota de la app” por contrato rígido.

Cuando se implemente FHIR, esto deberá resolverse con helpers explícitos de extracción/upsert de la nota gestionada por la app, evitando acoplar lógica a un índice fijo.

### 2.4 Estrategia de update de Patient para la futura etapa FHIR

Se acepta como estrategia inicial:

`GET -> merge controlado -> PUT completo`

Esto se considera suficiente para la etapa actual, dado el contexto single-user/transicional del proyecto.

#### Deuda explícita aceptada

Queda registrada como deuda conocida la ausencia de control de concurrencia optimista entre lectura y escritura del recurso.

No bloquea esta etapa, pero deberá revisarse si en el futuro aparece edición concurrente real o crecimiento de complejidad operativa.

### 2.5 Gate antes de abrir Encounter

Se deja explícito que Encounter no entra inmediatamente después de fundaciones técnicas.

Antes de abrir Encounter deben quedar firmes:

- infraestructura FHIR mínima,
- Patient end-to-end contra FHIR,
- EpisodeOfCare end-to-end contra FHIR,
- y una pausa formal de validación de la base resultante.

Esto busca contener scope creep y evitar abrir visitas/encuentros sobre una base todavía inestable.

## 3) Cambios requeridos en el código vigente

Este paso incluye cambios concretos en el código actual para dar de baja initialContext antes de empezar la integración FHIR.

### 3.1 Alcance del saneamiento

Se debe eliminar toda referencia vigente a initialContext en:

- tipos de dominio
- schemas Zod
- acciones
- formularios
- read models
- componentes de detalle/edición
- tests
- fixtures
- documentación del slice, si todavía lo nombra como capacidad vigente

### 3.2 Criterio de implementación

La baja de initialContext debe hacerse con estas reglas:

- no reemplazarlo por otro contenedor equivalente con otro nombre;
- no dejar campos residuales “temporales” en tipos o schemas;
- no dejar validaciones huérfanas;
- no sostener wiring nominal en forms o acciones si el modelo ya no lo usa.

El objetivo no es ocultarlo, sino removerlo realmente del estado vigente del slice.

### 3.3 Redistribución semántica

Si algún dato de initialContext sigue teniendo valor funcional real, debe resolverse solo en uno de estos dos destinos:

- notas generales del paciente
- descripción breve del tratamiento activo

Si un dato no encaja claramente en ninguno, no debe conservarse por inercia.

### 3.4 Superficies mínimas a revisar

- Dominio
	- `src/domain/patient/**`
	- contratos, tipos, schemas y reglas relacionados con patient
- Episodio
	- `src/domain/episode-of-care/**`
	- validar si algún campo de apertura o descripción quedó mezclado con initialContext
- App / acciones
	- `create-patient.action.ts`
	- `update-patient.action.ts`
	- `start-episode-of-care.action.ts`
- Loaders
	- `src/app/admin/patients/data.ts`
	- `src/app/admin/patients/[id]/data.ts`
- UI mínima
	- PatientCreateForm
	- PatientEditForm
	- PatientDetailView
	- StartEpisodeOfCareForm
- Tests
	- unit tests de dominio/schemas
	- integration tests de actions/loaders del slice

## 4) Roadmap revisado desde este punto

A partir de este paso, el plan deja de leerse como una secuencia larga “0–6” y pasa a ordenarse en bloques con gate de cierre.

### Bloque A — Fundaciones FHIR mínimas

Incluye solo lo indispensable:

- `FHIR_BASE_URL`
- cliente FHIR server-side
- parseo de errores / OperationOutcome
- tipos FHIR mínimos
- bundle utils mínimas
- helpers de identifier/reference
- search param builders mínimos

#### Gate de cierre

- request exitoso a HAPI local
- parseo consistente de bundle y errores
- sin cambio funcional visible en la app

### Bloque B — Patient end-to-end

Incluye:

- create
- update
- get by id
- list
- búsqueda por DNI
- bloqueo de duplicado ya apoyado en FHIR

#### Gate de cierre

- slice de patient funcionando contra HAPI
- tests verdes de mappers/repositorio relevantes
- sin dependencia runtime de in-memory para patient

### Bloque C — EpisodeOfCare end-to-end

Incluye:

- iniciar tratamiento
- leer episodio activo
- sostener reglas ya vigentes:
	- DNI obligatorio
	- no duplicado simple
	- no episodio activo duplicado

#### Gate de cierre

- creación y lectura del episodio activo funcionando contra HAPI
- detalle de paciente mostrando episodio real desde FHIR
- tests verdes integrados con patient

### Bloque D — Pausa obligatoria de validación

Antes de abrir Encounter se revisa:

- si la base quedó realmente estable,
- si el modelo sigue siendo suficiente,
- si las bundle utils siguen chicas,
- si los repositorios siguen legibles,
- y si aparecieron fricciones reales con HAPI.

Solo después de esta revisión se decide si Encounter entra o si corresponde una fase de hardening adicional.

## 5) Qué queda explícitamente fuera por ahora

Para mantener foco, en esta etapa siguen fuera:

- Encounter
- Observation
- Procedure
- transaction bundles
- historial longitudinal
- optimización con _include / _revinclude
- control de concurrencia fuerte
- auth
- agenda, pagos, /portal, multiusuario

## 6) Criterio de cierre del Paso 1

El Paso 1 se considera cerrado cuando:

- initialContext ya no existe en el modelo vigente;
- no quedan referencias activas en tipos, schemas, forms, acciones o tests;
- la semántica libre queda reducida a:
	- notas generales del paciente
	- descripción breve del episodio;
- la deuda de concurrencia queda documentada;
- el gate previo a Encounter queda escrito explícitamente;
- el roadmap revisado queda acordado como base de implementación.

## 7) Resultado esperado de este paso

Al cerrar este paso, el proyecto queda en una posición más sana para arrancar integración FHIR porque:

- el modelo es más chico,
- hay menos ambigüedad semántica,
- no se arrastra FHIR custom innecesario,
- y la migración deja de apoyarse en conceptos que ya no forman parte del diseño deseado.