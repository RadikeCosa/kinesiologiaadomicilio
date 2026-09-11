# Contrato operativo y clínico

> Estado: fuente activa para la remodelación
> Fecha: 2026-09-11
> Alcance: conocimiento operativo que debe sobrevivir a la separación de repositorios y a la reconstrucción del frontend privado.
> Importante: este documento diferencia el comportamiento implementado hoy de las decisiones acordadas para la nueva V1.

## 1. Propósito del producto privado

La aplicación privada organiza el ciclo clínico-operativo de un profesional independiente que realiza atención domiciliaria.

Su flujo central es:

```text
Solicitud -> Paciente -> Tratamiento -> Visitas -> Comunicación e informes
```

El producto no es una historia clínica integral ni un administrador genérico de pacientes. Su valor principal es registrar visitas con baja fricción y reutilizar esa información para construir comunicaciones e informes sin reescribir la evolución.

## 2. Lenguaje del producto

### Paciente

Persona atendida y eje longitudinal de identidad, contacto e historial.

### Solicitud de atención

Pedido inicial de evaluación o atención. Puede ser aceptado, cancelado, cerrado sin tratamiento o marcado como carga errónea. No equivale a tratamiento ni habilita visitas por sí mismo.

### Tratamiento

Ciclo clínico longitudinal con inicio, estado, contexto, objetivos, plan y cierre. En FHIR se representa actualmente con `EpisodeOfCare`.

### Visita

Atención completa realizada en el domicilio, con hora de entrada, hora de salida, intervención y respuesta clínica. Es el término principal de la interfaz.

### Sesión

Sinónimo natural de visita en comunicaciones e informes. No constituye una entidad diferente.

### Intervención

Trabajo profesional realizado dentro de una visita. No debe utilizarse como sinónimo de la visita completa.

### Métrica funcional

Medición estructurada y comparable asociada a una visita. Es opcional cuando no fue evaluada o no corresponde.

### Resumen de sesión

Texto derivado de una visita para un familiar o cuidador. No reemplaza la nota clínica profesional.

### Informe de período

Snapshot profesional de evolución o cierre que sintetiza un conjunto de visitas dentro de un tratamiento.

## 3. Ownership de la información

| Concepto de producto | Fuente canónica actual | Responsabilidad |
|---|---|---|
| Paciente | `Patient` | Identidad, datos administrativos y contacto principal |
| Solicitud | `ServiceRequest` | Pedido inicial, quién consulta, motivo y resolución operativa |
| Tratamiento | `EpisodeOfCare` | Ciclo, período, situación inicial, objetivos, plan y cierre |
| Diagnóstico | `Condition` | Diagnóstico médico de referencia y diagnóstico kinésico |
| Visita | `Encounter` | Período y registro clínico de una atención puntual |
| Métrica funcional | `Observation` | Medición objetiva vinculada a paciente y visita |
| Profesional | `Practitioner` | Identidad firmante, matrícula, contacto y firma |
| Informe persistido | `DocumentReference` | Snapshot final de evolución o cierre |

La UI nueva trabajará con nombres del dominio. Los nombres FHIR pertenecen al adaptador de infraestructura.

## 4. Flujo operativo vigente que debe preservarse

### 4.1 Ingreso de un caso

La puerta recomendada implementada actualmente es registrar una nueva solicitud:

1. se crea un `Patient` mínimo;
2. se crea una `ServiceRequest` vinculada en estado `in_review`;
3. se accede a la ficha del paciente para completar o resolver el caso.

La creación administrativa directa de un paciente sigue existiendo como alternativa para precarga, regularización o carga retrospectiva. No debe desaparecer sin una decisión explícita.

### 4.2 Resolución de la solicitud

Una solicitud puede avanzar, como mínimo, entre estos estados de dominio:

- `in_review`;
- `accepted`;
- `closed_without_treatment`;
- `cancelled`;
- `entered_in_error`.

Reglas:

- una solicitud no inicia tratamiento automáticamente;
- aceptar una solicitud no habilita visitas;
- marcar una carga errónea es una eliminación lógica, no un hard delete;
- una solicitud absorbida por un tratamiento no puede reutilizarse;
- una solicitud absorbida tampoco puede cambiar su fecha ni marcarse como errónea.

### 4.3 Inicio del tratamiento

Para iniciar un tratamiento se requiere:

- paciente correcto;
- datos operativos mínimos;
- solicitud `accepted` válida;
- solicitud todavía no utilizada por otro tratamiento.

El tratamiento se vincula a la solicitud mediante la referencia real correspondiente. La política vigente es single-use: un nuevo ciclo requiere una nueva solicitud.

### 4.4 Estado y cierre del tratamiento

- la regla normal es un solo tratamiento activo por paciente;
- si existen múltiples activos por inconsistencia, la lectura actual selecciona el de inicio más reciente y no autocorrige los datos;
- el cierre registra fecha, motivo y detalle opcional;
- finalizar tratamiento y redactar un informe son acciones distintas;
- un informe no debe bloquear ni reemplazar el cierre operativo.

### 4.5 Habilitación de visitas

Una visita solo puede registrarse dentro de un tratamiento activo. La mera existencia de paciente o solicitud no alcanza.

## 5. Contrato de visita para la nueva V1

El frontend actual solo crea visitas ya finalizadas y exige completar inicio y cierre juntos. La nueva aplicación reemplazará esa limitación.

### 5.1 Registro en tiempo real

1. el profesional inicia la visita al llegar;
2. se registra la hora de entrada;
3. la visita queda en curso y admite guardado progresivo;
4. se registra la información clínica durante la atención;
5. al retirarse se finaliza y registra la hora de salida.

### 5.2 Registro retrospectivo

Si no fue posible cargar durante la atención, el profesional puede registrar después:

- fecha de la visita;
- hora real de entrada;
- hora real de salida;
- información clínica correspondiente.

Debe distinguirse entre el tiempo de la atención, el tiempo de carga y el tiempo de sincronización.

### 5.3 Contenido clínico mínimo

Toda intervención profesional debe dejar reflejado:

- estado del paciente al inicio;
- trabajo o intervención realizada;
- respuesta del paciente;
- continuidad para próximas sesiones cuando corresponda.

Hora de entrada y salida también son obligatorias para una visita finalizada.

La matriz exacta de botones, opciones, métricas y texto libre todavía no está definida. Debe diseñarse posteriormente desde patrones reales de atención y necesidades de reporte.

### 5.4 Regla para datos estructurados

Se estructura un dato cuando permite al menos uno de estos usos:

- comparar evolución;
- detectar cambios o alertas;
- organizar pacientes o pendientes;
- componer resúmenes e informes;
- aplicar una regla de dominio.

La narrativa se reserva para matices, excepciones y contexto clínico que no puede reducirse sin perder significado.

No deben seleccionarse respuestas clínicas por defecto: ausencia de registro no equivale a evaluación negativa.

## 6. Contexto clínico longitudinal

El tratamiento es dueño del contexto que organiza múltiples visitas:

- diagnóstico médico de referencia;
- diagnóstico kinésico;
- situación funcional inicial;
- objetivos terapéuticos;
- plan general.

Las visitas consumen ese contexto y aportan información puntual. No deben reescribir en cada sesión el diagnóstico, la situación inicial o el plan completo.

El contexto offline de la nueva V1 será un snapshot de solo lectura para pacientes activos. Su contrato técnico vive en `docs/remodelacion/03-decisiones-arquitectura.md`.

## 7. Información puntual y objetiva

### Visita

La visita describe lo ocurrido en una atención concreta. El registro puede contener información estructurada y narrativa, pero no debe convertirse en una copia del tratamiento completo.

### Métrica funcional

Una métrica:

- se registra solo si fue evaluada;
- se vincula a la visita que le da contexto;
- debe conservar valor, unidad y momento de medición;
- puede alimentar tendencias e informes;
- no sustituye la interpretación profesional.

El proyecto actual implementa:

- Timed Up and Go en segundos;
- dolor NRS 0–10;
- tolerancia a bipedestación en minutos;
- duración de marcha en minutos.

La nueva taxonomía no queda limitada a esas cuatro métricas, pero cualquier ampliación requiere contrato y uso claros.

## 8. Documentación clínica y derivados

### 8.1 Fuente primaria

La fuente primaria es el dato registrado en paciente, solicitud, tratamiento, diagnóstico, visita, métrica o profesional.

### 8.2 Resumen familiar

- se deriva de una visita finalizada;
- se expresa en lenguaje comprensible;
- puede editarse sin cambiar la nota clínica;
- se comparte habitualmente como texto por WhatsApp;
- abrir WhatsApp no prueba que el mensaje haya sido enviado;
- no se persiste como documento formal en V1.

### 8.3 Informe de evolución

Sintetiza un período de tratamiento todavía activo, por ejemplo antes de una consulta médica o al finalizar un ciclo de sesiones.

### 8.4 Informe de cierre

Sintetiza el tratamiento o etapa que finaliza. Es distinto del motivo operativo de cierre.

### 8.5 Snapshot persistido

Un informe final:

- conserva texto, PDF, autor, fecha, período y fuentes resumidas;
- no reemplaza ni corrige los datos fuente;
- es inmutable;
- si necesita corrección, se crea una versión nueva y se conserva la anterior.

## 9. Regla contra la duplicación de escritura

El profesional no debería redactar dos veces el mismo conocimiento para:

- registrar la atención;
- comunicar la sesión;
- revisar la evolución;
- producir un informe.

Cuando un reporte no puede componerse sin reescritura extensa, primero debe revisarse dónde nace y vive el dato fuente. No se debe resolver automáticamente agregando más campos de texto.

## 10. Normalización durable de datos

Estas reglas deben sobrevivir aunque cambien los helpers concretos:

- DNI canónico: solo dígitos; el formato con separadores es presentación;
- teléfono: input flexible, valor normalizado como base para display y enlaces;
- género: valores internos compatibles con FHIR, etiquetas traducidas solo en UI;
- fechas de nacimiento e inicio/cierre: fechas calendario, no timestamps;
- fecha y hora de visitas: timestamps reales;
- inputs de fecha local: no derivar mediante `toISOString().slice(0, 10)`;
- orden de visitas: comparar timestamps, no strings localizados;
- edad: dato derivado para UI, no persistido;
- hora visible: formato de 24 horas en la experiencia local.

Las funciones exactas quedan respaldadas por tests y no necesitan una fuente documental separada.

## 11. Fallos y consistencia

### Estado actual

La creación actual de una visita puede completarse aunque falle una métrica funcional posterior; no existe rollback compensatorio del `Encounter`.

### Objetivo de remodelación

La nueva arquitectura debe definir explícitamente:

- qué operaciones son atómicas;
- cómo se reintentan métricas fallidas;
- cómo se comunica un éxito parcial;
- cómo se evita duplicar una visita;
- cómo se resuelve un conflicto sin perder contenido clínico.

Estas decisiones pertenecen a sincronización y persistencia, no a componentes visuales.

## 12. Invariantes de migración

La separación de repositorios y el frontend nuevo no pueden romper estas reglas:

1. solicitud, tratamiento y visita son conceptos diferentes;
2. una visita necesita un tratamiento activo;
3. una solicitud solo puede originar un tratamiento;
4. el paciente es el eje longitudinal;
5. el tratamiento posee el contexto general;
6. la visita posee lo ocurrido puntualmente;
7. las métricas son datos objetivos anexos a una visita;
8. nota, resumen familiar e informe no son el mismo artefacto;
9. un derivado no se convierte en fuente clínica paralela;
10. un informe final es un snapshot versionado;
11. una carga retrospectiva conserva la hora real de atención;
12. ningún fallo de sincronización puede descartarse silenciosamente.

## 13. Implementado hoy frente a objetivo V1

| Capacidad | Proyecto actual | Nueva V1 |
|---|---|---|
| Solicitud → paciente → tratamiento | Implementado | Preservar como flujo de soporte |
| Visita | Creación ya finalizada | Inicio, borrador, finalización y retrospectiva |
| Nota | Siete campos narrativos opcionales | Contrato mínimo híbrido todavía por diseñar |
| Offline | No implementado | Obligatorio para visitas y contexto activo |
| Auth | No implementada | Cuenta provisionada y sesión persistente |
| Resumen familiar | Derivado y compartible | Preservar, optimizado para teléfono |
| Informe de período | Texto persistido como snapshot | Evolución/cierre, texto + PDF inmutable |
| Portal familiar | No implementado | Fuera de V1 |

## 14. Fuentes relacionadas

- `docs/remodelacion/02-vision-y-alcance.md`: usuario, problema, promesa y V1.
- `docs/remodelacion/03-decisiones-arquitectura.md`: implementación conceptual, offline, sync y seguridad.
- `docs/fhir/README.md`: contrato del adaptador FHIR actual que se migrará.
- `docs/privacidad-entornos-y-demo.md`: datos reales, demo, dispositivos y publicación segura.
