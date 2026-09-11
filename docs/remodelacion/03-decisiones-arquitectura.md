# Decisiones de arquitectura para la aplicación privada

> Estado: decisiones fundacionales acordadas
> Fecha: 2026-09-11
> Visión relacionada: `docs/remodelacion/02-vision-y-alcance.md`
> Alcance: establecer fronteras, fuente de verdad, offline, sincronización, autenticación, documentos y topología. No selecciona todavía librerías concretas.

## 1. Resumen de decisiones

| Tema | Decisión |
|---|---|
| Repositorios | Landing y aplicación privada en dos repositorios distintos |
| Frontend privado | Reconstrucción desde cero, mobile-first y PWA |
| Modelo interno | Dominio propio, independiente de estructuras FHIR |
| Persistencia clínica V1 | HAPI FHIR como fuente principal de datos confirmados |
| Integración | FHIR detrás de puertos, repositorios y mappers |
| Acceso desde cliente | La PWA habla con la API privada; nunca directamente con HAPI FHIR |
| Offline | Contexto clínico activo, borradores y cola de visitas; no réplica completa |
| Sincronización | Operaciones idempotentes, confirmación explícita y sin last-write-wins |
| Cuenta V1 | Una cuenta profesional provisionada, sin registro público |
| Sesión | Persistente en dispositivos confiables, con renovación silenciosa |
| Dispositivos | Teléfono para captura; computadora para revisión e informes |
| Resumen familiar | Texto derivado y compartible; no documento formal persistido en V1 |
| Informe de período | PDF con membrete y snapshot persistido en `DocumentReference` |
| Versionado de informes | Versiones finales inmutables; una corrección crea una nueva versión |
| Topología inicial | Desarrollo y operación local con sincronización diferida |
| Topología objetivo | URL HTTPS privada, accesible solo desde dispositivos autorizados |

## 2. Arquitectura lógica

```text
PWA móvil / aplicación web
  ├── interfaz mobile-first
  ├── contexto clínico offline
  ├── borradores de visita
  └── cola de sincronización
             │
             ▼
API privada de la aplicación
  ├── autenticación y dispositivos
  ├── casos de uso
  ├── validación y reglas de dominio
  ├── sincronización e idempotencia
  └── composición de informes y PDFs
             │
             ▼
Puertos de persistencia
             │
             ▼
Adaptador FHIR
  ├── cliente HTTP
  ├── repositorios
  ├── mappers
  └── contratos FHIR R4 mínimos
             │
             ▼
HAPI FHIR R4
```

La API privada puede convivir dentro del runtime server de Next.js en V1. La separación es lógica: UI, casos de uso y adaptador FHIR no deben mezclarse aunque se desplieguen como una sola aplicación.

## 3. Dominio propio con persistencia FHIR

La aplicación piensa primero en conceptos del producto:

- paciente;
- solicitud de atención;
- tratamiento o ciclo;
- visita;
- contexto clínico;
- métrica funcional;
- resumen de sesión;
- informe de evolución o cierre;
- profesional;
- dispositivo y estado de sincronización.

FHIR sigue siendo la representación persistida principal en V1, pero no atraviesa la frontera de presentación.

```text
UI -> comando/caso de uso -> dominio -> puerto -> mapper -> recurso FHIR
```

Esto permite reutilizar el conocimiento y gran parte de la integración actual sin obligar al frontend nuevo a reflejar estructuras, extensiones o nombres de FHIR.

### Decisión sobre base relacional

No se agrega una segunda base clínica en V1.

Una base auxiliar podría aparecer si autenticación, sesiones o necesidades operativas la justifican, pero no competirá con HAPI FHIR como fuente de información clínica confirmada.

## 4. Frontera de seguridad

La PWA nunca recibe la URL interna de HAPI FHIR ni envía recursos FHIR directamente.

La única superficie accesible desde teléfono o computadora es la aplicación privada por HTTPS. HAPI FHIR debe permanecer:

- en loopback, red interna o segmento privado;
- accesible solo por la capa server de la aplicación;
- sin exposición directa a internet ni a dispositivos cliente;
- protegido por backups y controles operativos independientes de la PWA.

La red privada reduce exposición, pero no reemplaza la autenticación propia de la aplicación.

## 5. Modelo offline

El almacenamiento local no es una segunda historia clínica. Cumple tres funciones:

1. cache de contexto clínico activo;
2. borrador de visitas todavía no confirmadas;
3. cola durable de operaciones pendientes de sincronización.

### Disponible sin conexión

- abrir la PWA después de una autenticación previa válida;
- ver pacientes activos ya sincronizados;
- consultar contexto clínico mínimo;
- consultar actividad clínica reciente resumida;
- iniciar y finalizar una visita;
- cargar una visita retrospectiva;
- guardar y modificar el borrador local;
- identificar registros pendientes, fallidos o en conflicto.

### Requiere conexión

- crear pacientes o solicitudes;
- iniciar o cerrar tratamientos;
- editar información administrativa;
- consultar el historial completo;
- generar y confirmar el PDF final;
- cambiar configuración profesional;
- administrar credenciales y dispositivos.

## 6. Contexto clínico offline

Por cada paciente activo, el servidor prepara un read model específico para el dispositivo. No se almacenan recursos FHIR crudos.

El contexto contiene, como mínimo conceptual:

- identificación necesaria durante la atención;
- tratamiento activo;
- diagnóstico médico de referencia;
- diagnóstico kinésico;
- situación funcional inicial;
- objetivos terapéuticos;
- plan general;
- síntesis de actividad clínica reciente;
- última respuesta registrada;
- métricas funcionales recientes;
- fecha y hora de última actualización.

No se replica por defecto:

- la historia completa;
- tratamientos cerrados completos;
- informes históricos;
- solicitudes terminales;
- datos administrativos que no sean necesarios durante la atención.

La UI debe mostrar cuándo se actualizó el contexto para que el profesional pueda valorar si está desactualizado.

## 7. Ciclo de una visita

### Registro en tiempo real

```text
Iniciar visita
  -> registrar hora de entrada
  -> crear borrador
  -> documentar durante la atención
  -> finalizar visita
  -> registrar hora de salida
  -> validar contenido mínimo
  -> sincronizar
```

### Registro retrospectivo

Permite registrar manualmente cuándo comenzó y terminó una atención que no pudo cargarse en el momento.

El modelo debe distinguir:

- tiempo clínico: cuándo ocurrió la visita;
- tiempo de registro: cuándo se completó la información;
- tiempo de sincronización: cuándo el servidor la confirmó.

Una carga retrospectiva no debe presentarse como si hubiera sido iniciada en vivo.

### Estados de dominio y sincronización

El estado clínico de una visita y el estado de transporte no son lo mismo.

Ejemplos clínicos:

- en curso;
- finalizada.

Estados locales de sincronización:

- borrador local;
- listo para sincronizar;
- sincronizando;
- sincronizado;
- error de sincronización;
- conflicto que requiere revisión.

## 8. Contrato de sincronización

### Fuente de verdad

HAPI FHIR contiene la versión confirmada. El dispositivo conserva el borrador hasta recibir una confirmación inequívoca de la API.

### Idempotencia

- cada visita obtiene un identificador estable generado en el dispositivo;
- cada operación de sincronización obtiene una clave única;
- los reintentos reutilizan esas identidades;
- el servidor reconoce operaciones ya procesadas;
- una interrupción de red no puede producir visitas duplicadas.

La representación exacta del identificador dentro de FHIR se definirá al diseñar el adaptador.

### Ownership del borrador

El dispositivo donde comienza una visita es dueño del borrador hasta sincronizarlo.

Después de la confirmación:

- la visita puede leerse en todos los dispositivos;
- puede editarse online desde teléfono o computadora;
- no se mantiene indefinidamente una copia offline editable de la versión confirmada.

### Conflictos

Las ediciones incluyen la versión base utilizada. Si el servidor ya contiene otra versión:

- no gana silenciosamente la última escritura;
- no se descarta el contenido local;
- se conservan ambas versiones para revisión;
- el usuario elige cómo resolver el conflicto.

No se implementa edición colaborativa en tiempo real.

### Visibilidad

La PWA siempre debe indicar qué información:

- existe solo en el teléfono;
- está pendiente;
- fue confirmada;
- falló;
- necesita revisión.

## 9. Autenticación y dispositivos confiables

### Cuenta

- una cuenta profesional provisionada;
- sin registro público;
- sin roles, equipos u organizaciones;
- perfil profesional separado de la credencial.

### Sesión habitual

- autenticación inicial online;
- registro del teléfono o computadora como dispositivo confiable;
- sesión persistente;
- renovación silenciosa cuando existe conexión;
- apertura directa durante el uso cotidiano;
- sin pedir contraseña, PIN o biometría en cada ingreso.

### Acceso offline

Un dispositivo previamente autenticado recibe una autorización offline limitada y renovable. Su duración exacta se definirá durante la implementación.

La sesión requiere nueva autenticación si:

- el usuario cierra sesión;
- el dispositivo es revocado;
- cambian las credenciales;
- se borra el almacenamiento local;
- vence la autorización offline sin posibilidad de renovarla.

### Protección del dispositivo

Para habilitar datos offline se establece como requisito operativo que el dispositivo tenga bloqueo de pantalla con PIN, huella u otra credencial segura.

La aplicación debe permitir:

- listar dispositivos autorizados;
- mostrar su última conexión;
- revocar un dispositivo perdido;
- retirar datos locales al cerrar sesión o recibir una revocación.

Una revocación no puede alcanzar instantáneamente un dispositivo que permanece desconectado. Por eso la autorización offline no puede ser indefinida, aunque la experiencia normal sea permanecer logueado.

## 10. Roles de teléfono y computadora

### Teléfono

- consultar pacientes activos y contexto mínimo;
- iniciar, documentar y finalizar visitas;
- cargar retrospectivamente;
- gestionar pendientes de sincronización;
- generar y compartir el resumen familiar.

### Computadora

- revisar historia y evolución;
- corregir registros sincronizados;
- editar informes extensos;
- generar y descargar PDFs;
- configurar perfil, firma y membrete;
- administrar dispositivos.

Las capacidades no son exclusivas, pero cada superficie se optimiza para su tarea principal.

## 11. Resumen familiar de sesión

El resumen familiar:

- se deriva de una visita;
- se redacta en lenguaje claro;
- puede editarse sin modificar la nota clínica fuente;
- se comparte como texto mediante WhatsApp, Web Share o copia;
- no se considera enviado solamente porque la aplicación abrió WhatsApp;
- no se persiste como documento clínico formal en V1.

El portal futuro requerirá revisar la persistencia y publicación de estas comunicaciones.

## 12. Informe de período y PDF

### Generación

- requiere conexión;
- utiliza solo visitas confirmadas y sincronizadas;
- muestra el período y la fecha de actualización de las fuentes;
- advierte sobre pendientes o errores conocidos;
- compone un borrador de evolución o cierre;
- permite revisión y edición profesional;
- genera el PDF del lado del servidor.

### Persistencia

La versión final se guarda como `DocumentReference` asociado a `Patient` y `EpisodeOfCare`.

Debe conservar:

- tipo de informe;
- período incluido;
- fecha de creación;
- profesional autor;
- texto final;
- PDF exacto entregable;
- versión de plantilla;
- snapshots clínicos relevantes;
- cantidad y rango de visitas incluidas.

El adaptador actual que guarda texto base64 en `DocumentReference.content.attachment` es una referencia reutilizable. Debe ampliarse para representar el PDF y conservar el texto final. La elección entre adjuntos inline, `Binary` u otro almacenamiento queda para el diseño técnico, sin cambiar el contrato de dominio.

### Inmutabilidad

Una versión final no se edita.

Si se necesita corregir:

- se crea una nueva versión;
- la anterior se conserva;
- puede marcarse como reemplazada;
- la vista normal prioriza la versión vigente sin ocultar el historial.

## 13. Topología de despliegue

### Etapa inicial

- aplicación y HAPI FHIR ejecutados en infraestructura local;
- desarrollo y prueba del flujo offline;
- sincronización cuando el dispositivo alcanza el servidor;
- sin exigir que ya exista acceso remoto privado.

### Objetivo de uso móvil

- URL privada y estable con HTTPS válido;
- accesible desde teléfono y computadora autorizados fuera de la red doméstica;
- aplicación expuesta solo dentro de una red privada;
- HAPI FHIR no expuesto a dispositivos ni a internet;
- offline como continuidad ante cortes, no como único transporte diario.

La tecnología de VPN, red mesh, DNS, certificados, hardware y disponibilidad pertenece al proyecto de infraestructura “Casa”. La aplicación expresa requisitos y consume la conectividad resultante.

## 14. Seguridad y privacidad

Requisitos fundacionales:

- cifrado en tránsito mediante HTTPS;
- minimización del contexto almacenado en el dispositivo;
- almacenamiento local controlado, no uso indiscriminado de `localStorage`;
- no cachear respuestas clínicas mediante reglas genéricas del service worker;
- no registrar contenido clínico en logs, analytics o herramientas públicas;
- separación inequívoca entre entorno real y demo;
- datos ficticios en pruebas, fixtures, screenshots y portfolio;
- backups y restauración de la persistencia clínica;
- posibilidad de revocar dispositivos;
- migraciones seguras del esquema local de la PWA.

La estrategia exacta de cifrado local, claves y recuperación debe definirse antes de implementar datos offline reales.

## 15. Código actual reutilizable

### Reutilizar con cambios pequeños

- cliente FHIR y manejo de errores;
- tipos FHIR mínimos;
- bundle utilities, referencias y search params;
- mappers de recursos;
- reglas y schemas de dominio independientes de UI;
- compositores de resúmenes e informes;
- pruebas de mappers, repositorios y reglas.

### Desacoplar antes de migrar

- repositorios del cliente/configuración singleton;
- normalizaciones desde utilidades de display;
- features que importan módulos route-locales de `/admin`;
- casos de uso repartidos entre loaders, actions y rutas;
- estado de visita limitado actualmente a `finished`;
- `DocumentReference` limitado actualmente a un adjunto `text/plain`.

### No migrar como base

- componentes y layout privados actuales;
- jerarquía exacta de rutas `/admin`;
- formularios actuales de siete campos narrativos;
- supuestos visuales de escritorio;
- documentación histórica como contrato activo.

## 16. Decisiones abiertas de implementación

Estas decisiones no modifican la arquitectura fundacional y se resolverán al construir el repositorio nuevo:

- framework o proveedor concreto de autenticación;
- credencial inicial, passkey y recuperación;
- duración exacta de sesión y autorización offline;
- almacenamiento local y librería de IndexedDB;
- protección criptográfica de datos locales;
- formato exacto de comandos y endpoint de sincronización;
- versión y control de concurrencia sobre FHIR;
- representación FHIR de identificadores idempotentes;
- estrategia de actualización de PWA y migración local;
- motor de generación de PDF;
- adjunto PDF inline, recurso `Binary` o almacenamiento privado externo;
- política y herramienta de backup;
- tecnología de red privada y servidor físico.

## 17. Criterios de aceptación arquitectónicos

- la UI no importa tipos FHIR;
- el navegador nunca conoce ni alcanza directamente HAPI FHIR;
- una visita puede registrarse online, offline o retrospectivamente;
- un reintento no duplica la visita;
- ningún conflicto sobrescribe información silenciosamente;
- el usuario conoce siempre el estado de sincronización;
- el teléfono conserva solo el contexto clínico necesario;
- una sesión habitual no exige autenticación repetitiva;
- un dispositivo puede revocarse;
- un informe final conserva el texto y PDF exactos de esa versión;
- una corrección de informe crea una versión nueva;
- la aplicación puede cambiar su topología de red sin cambiar dominio ni UI.
