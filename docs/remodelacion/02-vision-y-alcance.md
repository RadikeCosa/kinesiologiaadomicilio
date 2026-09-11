# Visión y alcance del producto privado

> Estado: acuerdo fundacional de trabajo
> Fecha: 2026-09-11
> Producto: nueva aplicación privada para la operación clínico-profesional de kinesiología domiciliaria
> Alcance de este documento: definir usuario, problema, promesa, principios y límites de V1 sin anticipar el diseño detallado de formularios ni la arquitectura técnica.

## 1. Decisión de producto

La landing pública y la aplicación privada serán productos separados y vivirán en dos repositorios distintos.

- El repositorio público conservará la presencia profesional, captación, orientación inicial, SEO, analytics y contacto por WhatsApp.
- El repositorio privado será una aplicación nueva, centrada en el trabajo clínico y operativo cotidiano.
- No se creará inicialmente un paquete compartido entre ambos repositorios. Solo se extraerá código común si aparece una necesidad real y estable en los dos productos.

La aplicación privada se diseñará desde cero. El proyecto actual seguirá funcionando como fuente de conocimiento, reglas, pruebas y decisiones FHIR, no como plantilla visual que deba copiarse.

## 2. Usuario principal

El usuario principal es un kinesiólogo o kinesióloga independiente que:

- realiza atención domiciliaria;
- administra personalmente su cartera de pacientes;
- registra visitas e intervenciones;
- organiza tratamientos o ciclos de sesiones;
- comunica el resultado de una sesión a familiares o cuidadores;
- prepara informes de evolución o cierre para médicos tratantes u otros destinatarios profesionales.

El producto debe poder replicarse en el futuro para otros profesionales independientes, pero la V1 estará destinada a una única cuenta profesional provisionada.

### Qué significa single-user en V1

- existe una sola identidad profesional operativa;
- no hay equipos, organizaciones, invitaciones ni colaboración interna;
- no hay roles ni matriz de permisos;
- no hay registro público de nuevas cuentas;
- existe un entorno real privado y otro entorno demo independiente con datos ficticios;
- la arquitectura no debe impedir una evolución futura, pero tampoco debe pagar ahora el costo de un SaaS multiusuario.

## 3. Contexto de uso

La aplicación se utiliza principalmente desde el teléfono durante atención domiciliaria.

El contexto real incluye:

- tiempo clínico limitado;
- necesidad de concentrarse en el paciente y no en el sistema;
- interrupciones o situaciones que impiden terminar una carga en el momento;
- conectividad móvil ausente o inestable;
- necesidad de completar retrospectivamente una visita sin falsear cuándo ocurrió;
- uso posterior desde teléfono o computadora para revisar, corregir y generar informes.

Por eso, mobile-first, PWA y funcionamiento offline no son mejoras cosméticas: forman parte del problema central que la V1 debe resolver.

## 4. Problema principal

El registro de las visitas suele resultar lento, incómodo o quedar postergado. La información termina fragmentada entre memoria, WhatsApp, notas y otras herramientas que no representan el ciclo real del tratamiento.

Cuando llega el momento de comunicar una sesión o preparar un informe de período, el profesional debe reconstruir la evolución y volver a redactar información que ya produjo durante la atención.

Los tres problemas prioritarios son:

1. **Registrar las visitas sin interrumpir el trabajo clínico.**
2. **Reconstruir la evolución para preparar reportes sin duplicar escritura.**
3. **Mantener organizada la cartera de pacientes activos y las acciones pendientes.**

El ingreso de solicitudes y la administración general son capacidades necesarias, pero no constituyen el centro diferencial del producto.

## 5. Promesa de valor

> Registrar cada atención una sola vez, desde el teléfono y aun sin conexión, para mantener organizada la actividad profesional y generar comunicaciones e informes sin reconstruir todo manualmente.

Versión breve:

> Registrar una vez. Comunicar y reportar sin volver a escribir.

La aplicación no se posiciona como un administrador genérico de pacientes ni como una historia clínica integral. Es una herramienta privada de registro y seguimiento clínico longitudinal para profesionales que realizan atención domiciliaria.

## 6. Resultados que debe producir

### 6.1 Registro clínico de la visita

La visita es una actividad con ciclo propio:

- puede iniciarse al llegar al domicilio;
- puede documentarse durante la atención;
- puede finalizarse al retirarse;
- también puede cargarse o completarse retrospectivamente.

El sistema debe distinguir entre:

- cuándo ocurrió la atención;
- cuándo se registró o completó;
- cuándo se sincronizó con el servidor.

El contrato clínico mínimo acordado para una intervención debe reflejar:

- hora de entrada;
- hora de salida;
- estado del paciente al inicio;
- intervención realizada;
- respuesta del paciente;
- continuidad o plan para próximas sesiones cuando corresponda.

La decisión sobre qué parte se captura con botones, opciones, métricas o texto libre queda deliberadamente para una fase posterior de diseño de información.

### 6.2 Resumen de sesión

Comunicación habitual para un familiar o cuidador que no estuvo presente.

Debe:

- derivarse del registro de la visita;
- utilizar lenguaje claro y proporcionado al destinatario;
- permitir revisión y edición antes de compartir;
- compartirse habitualmente mediante WhatsApp desde el teléfono;
- tener una alternativa de compartir o copiar cuando WhatsApp no sea el canal elegido;
- evitar que la aplicación afirme que el mensaje fue enviado si no puede verificarlo.

El portal de pacientes o familiares podrá reemplazar parte de este intercambio en el futuro, pero queda fuera de V1.

### 6.3 Informe de período

Síntesis clínica preparada cuando:

- finaliza un tratamiento;
- finaliza un ciclo de sesiones;
- se aproxima una consulta médica;
- hace falta comunicar la evolución acumulada al médico tratante u otro destinatario profesional.

Debe:

- construirse desde la información registrada durante el período;
- diferenciar informe de evolución e informe de cierre;
- permitir revisión y edición profesional;
- reducir al mínimo la reconstrucción y reescritura manual;
- generarse como PDF con membrete, identidad y firma profesional;
- conservar una versión fechada de lo informado.

## 7. Principios de producto

### Registrar una vez

La información producida durante la atención debe alimentar historial, evolución, resumen de sesión e informe de período sin exigir múltiples redacciones del mismo hecho.

### La fuente clínica y los derivados no son lo mismo

El registro de la visita y los datos del tratamiento son fuentes primarias. Resúmenes e informes son representaciones derivadas para destinatarios y momentos diferentes.

### Mobile-first real

La experiencia principal se diseña para utilizarse desde el teléfono en un domicilio. La vista de escritorio puede ampliar capacidades de revisión, pero no define el flujo principal.

### El registro en el momento es preferente, no obligatorio

El producto facilita iniciar y finalizar una visita en tiempo real, pero admite carga retrospectiva cuando el contexto clínico, el tiempo o la conectividad lo impiden.

### Offline confiable

Una pérdida de conexión no debe provocar pérdida, duplicación ni falsa confirmación de datos. El usuario siempre debe saber si un registro está solo en el dispositivo, pendiente, sincronizado o en error.

### Estructura con propósito

Se estructuran los datos que después permiten comparar, detectar cambios, ordenar trabajo o componer reportes. La narrativa se reserva para matices clínicos, excepciones y contexto que no conviene reducir a opciones.

### Privacidad desde el diseño

El uso offline y la sesión persistente no deben convertir el teléfono en un repositorio clínico desprotegido. La solución técnica deberá minimizar y proteger la información local.

### Complejidad proporcional

La V1 resuelve el flujo de un profesional independiente. No incorpora estructuras de EHR, organización o SaaS que todavía no responden a una necesidad validada.

## 8. Alcance funcional de V1

### 8.1 Identidad y acceso

- una cuenta profesional provisionada;
- autenticación inicial online;
- sesión persistente en un dispositivo confiable;
- acceso posterior con la menor fricción posible;
- saludo e identidad de la experiencia basados en el perfil profesional;
- cierre de sesión manual;
- base para revocar un dispositivo perdido;
- acceso offline después de una autenticación previa válida;
- entorno demo independiente y sin datos reales.

La implementación concreta —credencial, passkey, biometría, duración de sesión y recuperación— se decidirá en arquitectura.

### 8.2 Organización clínica y operativa

- vista prioritaria de pacientes activos;
- identificación de visitas en curso, borradores y sincronizaciones pendientes;
- acceso rápido al registro de visita;
- ficha de paciente;
- tratamiento o ciclo de sesiones activo;
- historial de tratamientos y visitas;
- ingreso mínimo de solicitudes y pacientes como flujo de soporte.

### 8.3 Registro de visitas

- iniciar una visita en tiempo real;
- finalizarla registrando la hora de salida;
- guardar avances sin exigir completar todo de una vez;
- cargar una visita retrospectivamente;
- registrar el contenido clínico mínimo acordado;
- agregar información y métricas adicionales cuando corresponda;
- editar o completar posteriormente;
- identificar claramente el estado local y de sincronización.

### 8.4 Seguimiento longitudinal

- cronología del tratamiento;
- acceso a visitas registradas;
- lectura acumulada de intervenciones, respuestas y continuidad;
- tendencias de métricas cuando existan;
- base de información reutilizable para reportes.

La V1 no necesita sustituir la memoria clínica del profesional con recomendaciones automáticas. El valor principal de esta lectura longitudinal es sostener reportes confiables.

### 8.5 Comunicación e informes

- generar un resumen por sesión;
- revisar y editar antes de compartir;
- compartir texto mediante WhatsApp o el mecanismo nativo disponible;
- generar informe de evolución por período;
- generar informe de cierre;
- revisar y editar el contenido profesional;
- exportar a PDF con membrete y firma;
- conservar el snapshot final del informe.

### 8.6 Configuración profesional

- nombre e identidad profesional;
- matrícula y jurisdicción;
- datos de contacto;
- firma o texto de firma;
- membrete y preferencias necesarias para documentos.

## 9. Fuera de V1

- portal de pacientes o familiares;
- registro público y onboarding autónomo de profesionales;
- equipos, organizaciones, roles y permisos;
- agenda completa o self-booking;
- pagos y facturación;
- mensajería interna;
- envío automático de WhatsApp;
- confirmación automática de que un mensaje externo fue recibido;
- inteligencia artificial productiva;
- recomendaciones clínicas automáticas;
- interoperabilidad FHIR exhaustiva;
- historia clínica integral;
- múltiples especialidades o modelos asistenciales desde el inicio.

## 10. Criterios de éxito de V1

La V1 cumple su promesa cuando el profesional puede:

- abrir la PWA desde su teléfono y entrar a su espacio habitual sin autenticarse repetidamente;
- identificar rápidamente los pacientes activos y registros pendientes;
- iniciar y finalizar una visita sin cargar horarios manualmente;
- registrar retrospectivamente una sesión cuando no pudo hacerlo en el momento;
- continuar trabajando ante una interrupción de conectividad sin perder datos;
- distinguir con certeza qué está sincronizado y qué permanece local;
- completar un registro clínico mínimo sin que la interfaz domine la atención;
- producir un resumen familiar desde la visita con una edición breve;
- producir un informe de período sin reconstruir manualmente todas las sesiones;
- generar un PDF profesional listo para revisar y compartir;
- operar una demo sin riesgo de mezclar datos ficticios y reales.

No se fijan todavía métricas numéricas de tiempo o cantidad de interacciones. Esas métricas deberán definirse al diseñar y probar los flujos concretos.

## 11. Decisiones fundacionales cerradas

- landing y aplicación privada en dos repositorios;
- aplicación privada reconstruida desde cero;
- producto replicable para profesionales independientes;
- V1 con una única cuenta provisionada;
- sin registro público;
- mobile-first y PWA;
- registro online, offline, en tiempo real y retrospectivo;
- pacientes activos como organización principal;
- reportes como resultado central del registro;
- resumen de sesión orientado a familiar/cuidador;
- informe de período orientado a médico u otro destinatario profesional;
- PDF con membrete para informes de período;
- portal de pacientes como evolución posterior, no V1.

## 12. Decisiones que pasan a arquitectura o diseño

### Arquitectura

- HAPI FHIR como persistencia principal o FHIR como adaptador;
- forma concreta de autenticación y recuperación;
- seguridad de la sesión persistente y del acceso offline;
- almacenamiento local y estrategia de sincronización;
- prevención de duplicados y manejo de conflictos;
- generación y persistencia de PDFs;
- representación técnica de borradores, visitas en curso y snapshots.

### Diseño de información y experiencia

- matriz exacta de datos estructurados y narrativos;
- controles concretos para el registro móvil;
- campos obligatorios, opcionales y condicionales;
- plantillas y vocabulario de intervenciones;
- composición exacta del resumen familiar;
- secciones y redacción del informe de período;
- navegación y jerarquía visual.

Estas decisiones deben partir de la visión y el alcance acordados en este documento, no redefinirlos accidentalmente.
