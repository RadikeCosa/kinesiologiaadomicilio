# Baseline actual para la remodelación

> Estado: baseline de trabajo
> Fecha de relevamiento: 2026-09-11
> Rama y commit base: `main` en `6da04aa`
> Alcance: describir el punto de partida verificable antes de separar repositorios, podar documentación o reconstruir la interfaz privada.

## 1. Propósito

Este documento congela una lectura compartida del proyecto actual. Distingue:

- hechos comprobados en el repositorio;
- conocimiento y código que conviene preservar;
- piezas que requieren desacoplamiento antes de migrar;
- superficies que pueden reconstruirse desde cero;
- decisiones de producto y arquitectura que todavía siguen abiertas.

No es la visión definitiva del producto nuevo ni autoriza por sí mismo una migración. Su función es evitar que la remodelación parta de documentación histórica, supuestos o decisiones anticipadas.

## 2. Estado verificable del punto de partida

El relevamiento se realizó sobre `main` en el commit `6da04aa`, con trabajo local posterior todavía no consolidado.

### Cambios locales presentes durante el relevamiento

- modificación del índice documental;
- ajustes de mensajes de WhatsApp para `/evaluar`;
- pruebas nuevas o actualizadas para esos mensajes y analytics;
- propuesta inicial de redirección, hoy absorbida por los documentos de esta remodelación y retirada de la documentación activa.

Estos cambios se consideran trabajo en curso y forman parte del contexto observado. Antes de crear una etiqueta o commit formal de baseline se debe decidir cuáles integran el punto de partida definitivo.

### Verificaciones ejecutadas

| Verificación | Resultado |
|---|---|
| Suite automatizada | 119 archivos y 774 pruebas aprobadas |
| Build con `FHIR_BASE_URL=http://localhost:8081/fhir` | Aprobado |
| Lint | Aprobado, sin advertencias de código |
| Herramienta de lint | `next lint` funciona, pero está deprecada y deberá migrarse a ESLint CLI |

El baseline es funcional. La remodelación no parte de un proyecto roto, sino de una aplicación operativa cuyo principal problema es la mezcla de identidades y responsabilidades.

## 3. Qué producto existe hoy

El repositorio contiene dos superficies que comparten runtime, configuración global y sistema visual, pero tienen objetivos distintos.

### Superficie pública

Rutas:

- `/`;
- `/services`;
- `/evaluar`.

Responsabilidad actual:

- adquisición local para kinesiología a domicilio en Neuquén;
- orientación inicial;
- conversión mediante WhatsApp;
- SEO, metadata, datos estructurados y GA4.

Tamaño orientativo sin pruebas: 10 archivos TypeScript/TSX y unas 754 líneas dentro de `src/app/(public)`.

La superficie pública no importa módulos de dominio clínico, features privadas, repositorios ni el cliente FHIR. Esta es la evidencia técnica más fuerte a favor de que puede separarse con bajo riesgo.

### Superficie privada

Rutas detectadas en el build:

- `/admin`;
- `/admin/configuracion/profesional`;
- `/admin/requests/new`;
- `/admin/patients`;
- `/admin/patients/new`;
- `/admin/patients/[id]`;
- `/admin/patients/[id]/administrative`;
- `/admin/patients/[id]/encounters`;
- `/admin/patients/[id]/encounters/new`;
- `/admin/patients/[id]/treatment`;
- `/admin/patients/[id]/treatment/report`.

Responsabilidad actual:

- ingreso de solicitudes;
- gestión administrativa de pacientes;
- inicio y cierre de tratamientos;
- registro de visitas y notas clínicas;
- métricas funcionales;
- resúmenes compartibles e informes evolutivos;
- configuración del profesional firmante.

Tamaño orientativo sin pruebas: 71 archivos TypeScript/TSX y unas 10.478 líneas dentro de `src/app/admin`.

La diferencia de tamaño confirma que `/admin` ya no es una pantalla secundaria de la landing: es el producto funcional dominante dentro del código.

## 4. Arquitectura efectiva actual

La dirección conceptual declarada sigue siendo válida:

```text
Lectura
HAPI FHIR -> cliente FHIR -> repositorio -> mapper -> read model/loader -> UI

Escritura
Formulario -> server action -> esquema Zod -> regla de dominio -> repositorio -> payload FHIR
```

### Capas observadas

| Área | Responsabilidad | Tamaño sin pruebas |
|---|---|---:|
| `src/domain` | Tipos, esquemas, selectores y reglas clínicas/operativas | 23 archivos / ~1.937 líneas |
| `src/features` | Composición y lectura de informes y configuración | 12 archivos / ~1.164 líneas |
| `src/infrastructure` | Repositorios y traducción entre dominio y recursos FHIR | 38 archivos / ~2.811 líneas |
| `src/lib/fhir` | HTTP, configuración, errores y utilidades FHIR | 10 archivos / ~687 líneas |
| `src/app/admin` | UI, loaders, acciones y parte de la coordinación de casos de uso | 71 archivos / ~10.478 líneas |

HAPI FHIR es el backend de persistencia actual. El código reutilizable del repositorio es la integración server-side que lo consume: cliente HTTP, tipos FHIR mínimos, mappers, repositorios y reglas de dominio.

## 5. Activos que conviene preservar

### Preservar como conocimiento y contrato

- `Patient` como eje longitudinal;
- `ServiceRequest` como entrada operativa, separada del tratamiento;
- `EpisodeOfCare` como ciclo de tratamiento;
- `Encounter` como visita realizada;
- `Observation` como métrica funcional opcional;
- `Condition` como diagnóstico de referencia o kinésico;
- `Practitioner` como profesional firmante;
- `DocumentReference` como snapshot persistido de informes;
- reglas para aceptar solicitudes e iniciar/cerrar tratamientos;
- separación entre nota clínica, resumen compartible e informe;
- criterios de privacidad, datos ficticios y entornos separados.

### Preservar preferentemente como código

- reglas y esquemas de `src/domain`;
- mappers FHIR de lectura y escritura;
- utilidades del cliente FHIR y manejo de errores;
- repositorios, después de volver inyectable su dependencia de transporte/configuración;
- compositores y validadores de completitud de informes;
- pruebas de dominio, mappers y repositorios;
- datos y lógica del seed ficticio, revisados antes de trasladarlos.

El criterio de migración no debe ser “copiar carpetas”, sino conservar contratos respaldados por pruebas.

## 6. Acoplamientos que deben resolverse antes de reutilizar

### Dependencias desde features hacia rutas

La feature de informe de tratamiento importa `functional-trend` y `clinical-context` desde `src/app/admin`. Esto invierte la dirección deseada: una feature reutilizable no debería depender de una ruta o superficie de presentación.

Acción recomendada: trasladar esos cálculos y tipos a dominio o aplicación, y hacer que tanto las rutas como los informes dependan de esa ubicación neutral.

### Dominio e infraestructura dependientes de utilidades de presentación

Parte de los esquemas y repositorios de paciente utiliza `src/lib/patient-admin-display.ts` para normalizaciones. El archivo combina responsabilidades de representación administrativa con transformaciones que también necesita el dominio.

Acción recomendada: separar normalización pura de DNI, teléfono, fechas y contactos de cualquier formateo destinado a UI.

### Casos de uso distribuidos

La coordinación del flujo vive entre server actions, loaders, read models, rutas y repositorios. Esto funciona dentro del proyecto actual, pero dificulta reconstruir el frontend o cambiar persistencia sin copiar estructura de Next.js.

Acción recomendada: introducir una capa de aplicación explícita con casos de uso como:

- registrar solicitud;
- aceptar o cerrar solicitud;
- iniciar tratamiento;
- registrar visita;
- actualizar nota clínica;
- cerrar tratamiento;
- generar y persistir informe.

### Cliente FHIR global

Los repositorios importan un cliente singleton que obtiene `FHIR_BASE_URL` directamente del entorno. Es simple para el runtime actual, pero dificulta probar otros adaptadores o ejecutar dominio sobre otra persistencia.

Acción recomendada: definir puertos de repositorio o factorías con dependencias inyectables. Esto no implica abandonar FHIR; permite que FHIR sea una implementación explícita.

## 7. Matriz inicial de migración

| Pieza actual | Decisión inicial | Motivo |
|---|---|---|
| Landing pública | Mantener como producto independiente | Está aislada, desplegada y responde a un objetivo comercial concreto |
| UI de `/admin` | Reconstruir desde cero | La nueva experiencia debe organizarse alrededor del trabajo diario, no de las rutas heredadas |
| Reglas y tipos de dominio | Conservar y ajustar | Contienen el conocimiento más valioso y tienen cobertura automatizada |
| Cliente y utilidades FHIR | Conservar | Son pequeños, server-side y mayormente independientes de UI |
| Mappers FHIR | Conservar con revisión | Codifican decisiones de interoperabilidad ya probadas |
| Repositorios FHIR | Desacoplar y reutilizar | Hoy dependen de cliente/configuración global y alguna utilidad mal ubicada |
| Server actions y loaders | Reescribir alrededor de casos de uso | Están ligados a rutas y a la estructura actual de Next.js |
| Compositores de resúmenes e informes | Conservar después de desacoplar | Tienen valor funcional y pruebas, pero algunas dependencias apuntan a `/app/admin` |
| Componentes privados | Usar solo como referencia | El objetivo declarado es replantear el frontend completo |
| Pruebas de dominio e infraestructura | Migrar como contrato | Permiten comprobar que la remodelación no pierde reglas clínicas |
| Pruebas de páginas/componentes actuales | Seleccionar, no copiar masivamente | Verifican una UI que será reemplazada |
| Screenshots actuales | Archivar como evidencia histórica | No deben presentarse como el producto nuevo |
| Documentación histórica/auditorías | Mantener archivada | Conserva trazabilidad sin competir con las fuentes vigentes |

## 8. Evaluación inicial de separación de repositorios

### Opción A: continuar en un único repositorio

Ventajas:

- no requiere migración inicial;
- mantiene un solo entorno de desarrollo;
- permite compartir componentes y configuración directamente.

Costos:

- conserva la identidad mixta;
- acopla despliegue público y runtime privado;
- facilita que la landing vuelva a condicionar decisiones del producto clínico.

### Opción B: monorepo con aplicaciones separadas

Ventajas:

- límites de despliegue claros;
- posibilidad de compartir paquetes internos;
- migración gradual con una sola historia Git.

Costos:

- añade herramientas y disciplina de paquetes;
- puede ser complejidad prematura para un producto mantenido por una persona.

### Opción C: dos repositorios

Ventajas:

- identidad, despliegue y seguridad independientes;
- la landing puede seguir estable mientras se reconstruye la app privada;
- el producto clínico nace sin estructura visual heredada.

Costos:

- cualquier código compartido debe duplicarse inicialmente o publicarse como paquete;
- requiere definir con precisión qué se migra y qué queda como referencia;
- aumenta el mantenimiento si ambos proyectos evolucionan coordinadamente.

### Hipótesis de trabajo recomendada

Usar dos repositorios, pero no separar físicamente todavía:

1. consolidar este baseline;
2. aislar contratos y dependencias reutilizables;
3. definir la V1 privada y la estrategia de persistencia;
4. crear el repositorio privado nuevo;
5. dejar este repositorio como landing funcional y referencia histórica de la implementación original.

Esta hipótesis debe confirmarse mediante una decisión de arquitectura breve. No se considera cerrada solamente por figurar en este baseline.

## 9. Baseline documental

Durante el relevamiento existen 14 documentos Markdown fuera de `docs/archive` y otros 14 ya archivados. También hay screenshots públicas y privadas que funcionan como evidencia histórica.

Se detectan inconsistencias que justifican la poda:

- la lista principal de rutas de la fuente operativa omite `/admin/patients/[id]/treatment/report`, aunque la ruta existe y el mismo documento la menciona después;
- la lista de recursos FHIR activos omite `DocumentReference`, aunque existe repositorio, mappers, pruebas y persistencia de informes;
- el README declara 98 archivos y 653 pruebas, mientras el baseline verificado contiene 119 archivos y 774 pruebas;
- el índice activo enlaza dos auditorías en ubicaciones que ya no existen porque fueron archivadas;
- conviven documentos de diseño previo, arquitectura objetivo, auditorías e informes de redirección con distinto grado de vigencia.

### Conjunto documental activo propuesto

Para atravesar la remodelación deberían quedar visibles como máximo estas fuentes:

1. `README.md`: presentación vigente del repositorio que efectivamente contiene;
2. `docs/remodelacion/00-baseline-actual.md`: punto de partida verificable;
3. `docs/remodelacion/01-vision-y-alcance.md`: producto objetivo y V1, una vez decididos;
4. `docs/remodelacion/02-decisiones-arquitectura.md`: repositorios, persistencia, auth y demo;
5. `docs/operacion.md`: flujo y reglas clínicas/operativas que sobreviven;
6. `docs/fhir/README.md`: contrato del adaptador FHIR que realmente se preserve;
7. una guía breve de privacidad, entornos y demo segura.

### Regla de poda

Cada documento actual deberá clasificarse como:

- **conservar**: sigue siendo una fuente vigente y no duplica otra;
- **fusionar/reformular**: contiene conocimiento útil que debe pasar a una fuente nueva;
- **archivar**: explica decisiones o estados anteriores, pero no guía el trabajo futuro;
- **eliminar**: no contiene información única y su historial ya queda preservado en Git.

No se debería borrar ni mover documentación hasta completar esa clasificación y rescatar primero cualquier contrato único.

## 10. Decisiones todavía abiertas

El baseline no cierra las siguientes decisiones:

1. identidad exacta y usuario principal del producto privado;
2. alcance mínimo de la primera versión reconstruida;
3. dos repositorios versus monorepo;
4. HAPI FHIR como persistencia principal versus dominio propio con adaptador FHIR;
5. mecanismo de autenticación single-user;
6. separación entre entorno real, desarrollo y demo ficticia;
7. despliegue permitido para la aplicación privada;
8. estrategia para compartir o no código entre landing y aplicación.

## 11. Criterio de cierre de la fase baseline

La fase baseline queda cerrada cuando:

- se decide qué hacer con los cambios locales observados;
- existe un commit limpio y, si resulta útil, una etiqueta de referencia;
- se acepta o corrige la matriz inicial de migración;
- cada documento activo tiene una clasificación de poda;
- las decisiones abiertas están registradas sin quedar mezcladas con el estado actual;
- se elige la primera decisión arquitectónica a resolver.

## 12. Próximo paso recomendado

Construir el inventario documental de poda y, en paralelo, redactar la decisión sobre la frontera entre productos y repositorios.

El orden recomendado es:

1. clasificar la documentación actual;
2. rescatar contratos únicos en las nuevas fuentes mínimas;
3. archivar o eliminar duplicados;
4. decidir formalmente uno, dos repositorios o monorepo;
5. recién entonces preparar la extracción del núcleo reutilizable y el esqueleto del frontend privado nuevo.
