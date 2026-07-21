# Principios del sistema de documentación clínica

> Estado: borrador operativo
> Base: comportamiento vigente del repositorio, contratos de dominio, mappers, read models y auditorías internas de carga documental y modelo de conocimiento clínico.

## Propósito

Este documento fija criterios para evaluar futuros cambios en la documentación clínica y administrativa del producto sin convertir artefactos derivados en una segunda fuente de verdad.

## Categorías de información

### Información estable

Datos que identifican a la persona, permiten contactarla o sostienen la operación con baja frecuencia de cambio.

- Entidad canónica: `Patient`
- Ejemplos actuales: nombre, apellido, DNI, teléfono, domicilio, contacto principal, fecha de nacimiento, género.

### Información de ingreso

Datos que nacen cuando el caso entra al sistema y describen el pedido inicial, no el tratamiento ya iniciado.

- Entidad canónica: `ServiceRequest`
- Ejemplos actuales: fecha de solicitud, motivo de consulta, quién consulta, estado de la solicitud, motivo de no inicio o cancelación.

### Información longitudinal

Datos que organizan un ciclo terapéutico a lo largo de semanas o meses.

- Entidad canónica: `EpisodeOfCare`
- Soporte diagnóstico canónico: `Condition`, enlazada desde `EpisodeOfCare`
- Ejemplos actuales: fecha de inicio y cierre del tratamiento, situación funcional inicial, objetivos terapéuticos, plan general, motivo de cierre, detalle de cierre, diagnóstico médico de referencia, diagnóstico kinésico.

### Información puntual

Datos que describen una visita específica y no deben convertirse por sí solos en contexto general del episodio.

- Entidad canónica: `Encounter`
- Ejemplos actuales: inicio y cierre de la visita, puntualidad, subjetivo, objetivo, intervención realizada, respuesta inmediata, tolerancia, indicaciones domiciliarias, próximos pasos inmediatos.

### Información objetiva

Mediciones comparables entre visitas, con valor como dato fuente estructurado.

- Entidad canónica: `Observation`
- Ejemplos actuales: TUG, dolor NRS, tolerancia de bipedestación, duración de marcha.

### Información derivada

Lecturas, estadísticas, tendencias, resúmenes o documentos que el sistema construye a partir de datos fuente.

- Entidades canónicas:
  - derivado efímero: read models, composers y textos no persistidos;
  - derivado persistido: `DocumentReference`.
- Ejemplos actuales: tendencia funcional, estadísticas de visitas, resumen compartible, informe de progreso, informe de cierre, snapshots de contexto dentro del informe persistido.

## Rol de cada entidad

### `Patient`

Es la identidad longitudinal de la persona y su base operativa. No debe transformarse en contenedor del relato clínico del tratamiento ni de cada visita.

### `ServiceRequest`

Es la puerta de entrada del caso. Captura el pedido inicial y su resolución administrativa. No debe absorber conocimiento propio del seguimiento terapéutico.

### `EpisodeOfCare`

Es el contenedor canónico del ciclo clínico. Debe concentrar el contexto que organiza múltiples visitas.

### `Condition`

Es el lugar canónico de los diagnósticos que el sistema trata como conocimiento clínico y no solo como referencia narrativa.

### `Encounter`

Es la unidad canónica de la atención realizada. Debe capturar lo ocurrido en una visita concreta.

### `Observation`

Es la unidad canónica de medición objetiva. Debe contener aquello que necesita comparación estructurada entre visitas.

### `Practitioner`

Es el dueño de la identidad del profesional firmante y de los datos requeridos para firma o comunicación formal.

### `DocumentReference`

Es un snapshot documental persistido. Puede archivar un informe final, pero no debe reemplazar la fuente clínica viva.

## Uso de texto libre

Corresponde usar texto libre cuando el sistema necesita registrar:

- excepciones clínicas;
- incidentes o hechos no estructurables con los campos actuales;
- razonamiento profesional puntual;
- cambios relevantes que no pueden reducirse a una métrica;
- explicaciones de cierre o discontinuidad que requieran contexto adicional.

El texto libre empieza a repetir conocimiento existente cuando:

- vuelve a narrar datos estables de `Patient`;
- reescribe el motivo inicial de `ServiceRequest` como si fuera contexto de seguimiento;
- vuelve a explicar en cada visita el marco longitudinal ya establecido en `EpisodeOfCare`;
- reingresa en un documento derivado información ya registrada en `Encounter`, `Observation`, `Condition` o `EpisodeOfCare`.

## Distinciones clínicas clave

### Evolución inmediata

Interpretación de la respuesta observada en una visita puntual.

- Propietario canónico: `Encounter`

### Evolución longitudinal

Lectura del progreso del tratamiento a lo largo del episodio.

- Propietario canónico: `EpisodeOfCare`
- Puede apoyarse en múltiples `Encounter` y `Observation`

### Tendencia funcional

Comparación derivada entre observaciones objetivas registradas en distintas visitas.

- Propietario canónico: derivado desde `Observation`

### Comunicación evolutiva

Texto preparado para compartir o archivar una síntesis del estado del caso.

- Propietario canónico: derivado efímero o `DocumentReference` si se persiste

## Fuente primaria, resumen compartible e informe persistido

- La **fuente primaria** es el dato clínico o administrativo registrado en `Patient`, `ServiceRequest`, `EpisodeOfCare`, `Condition`, `Encounter`, `Observation` o `Practitioner`.
- El **resumen compartible** es comunicación derivada. Puede ser útil para coordinación, pero no reemplaza la nota clínica interna.
- El **informe persistido** es una foto documental de un momento del tratamiento. Puede conservar snapshots y texto final, pero no debe adquirir autoridad superior a la fuente primaria.

## Regla crítica sobre artefactos derivados

Los documentos derivados no deben convertirse en una fuente clínica paralela.

Esto implica:

- no usar un informe persistido para corregir retroactivamente el dato fuente;
- no depender de un resumen compartible como sustituto de la nota de visita;
- no mover al documento final conocimiento que debería vivir una sola vez en `EpisodeOfCare`, `Condition`, `Encounter` u `Observation`.

## Criterios para evaluar futura carga documental

Al revisar un cambio futuro, la pregunta principal no debe ser “si escribe menos”, sino:

- si el dato nace en la entidad correcta;
- si el dato será reutilizable sin reescritura;
- si exige narrativa clínica genuina o si solo compensa una mala ubicación del conocimiento;
- si obliga al profesional a escribir pensando en un reporte futuro en lugar de registrar la atención real;
- si crea una segunda versión textual de un mismo hecho con distinto estatus clínico.

## Regla operativa final

El profesional no debería tener que redactar dos veces el mismo conocimiento para satisfacer:

- la atención;
- la revisión longitudinal;
- la comunicación compartible;
- el archivo documental.

Cuando eso ocurre, el problema debe tratarse primero como un problema de ubicación del conocimiento antes que como un problema de interfaz.
