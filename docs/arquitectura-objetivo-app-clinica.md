# Arquitectura y dirección del proyecto

> Estado: vigente como dirección técnica y de producto
> Última actualización: 2026-06-24 (UTC)
> Nota: reemplaza como referencia principal a `docs/decisiones-evolucion-app-clinica.md`, ahora archivado en `docs/archive/cierres/`.

## Propósito

Este documento explica la dirección del proyecto más allá del estado puntual implementado hoy.

Sirve para dos usos:

- entender qué tipo de producto se está construyendo;
- mantener una dirección técnica consistente cuando la app clínica privada siga creciendo.

No reemplaza a `docs/fuente-de-verdad-operativa.md`, que sigue siendo la fuente principal del comportamiento vigente.

## Decisiones base

1. La landing pública sigue siendo una superficie activa y principal del repositorio.
2. El mismo repo puede alojar una app clínica privada conviviente, siempre que no se mezclen dominios.
3. Esa evolución es deliberadamente incremental: no implica que todo el modelo objetivo ya exista hoy.
4. El foco funcional de la app clínica privada sigue siendo pequeño y operativo:
   - paciente;
   - contacto principal;
   - tratamiento activo;
   - visitas;
   - seguimiento funcional mínimo.
5. Siguen fuera de alcance como dirección inicial:
   - agenda;
   - pagos;
   - self-booking;
   - panel administrativo amplio;
   - multiusuario robusto por defecto.

## Separación de dominios

La convivencia en un mismo repo no implica mezclar lenguaje, objetivos ni responsabilidades.

### A. Landing pública

- `/`
- `/services`
- `/evaluar`

Objetivo:

- captación;
- orientación inicial;
- contacto;
- SEO y medición pública.

### B. App clínica privada del profesional

- `/admin/...`

Objetivo:

- operación mínima del profesional;
- pacientes;
- solicitudes;
- tratamiento;
- visitas;
- seguimiento clínico-operativo incremental.

### C. Portal futuro

- `/portal`

Es solo una dirección posible a futuro y no debe tratarse como implementación actual ni como prioridad inmediata.

## Principios de arquitectura

### Lectura

`FHIR Server -> FHIR Client -> Repository -> Mapper -> Read model / loader -> UI`

Principios:

- FHIR no cruza crudo a la UI.
- La UI consume read models o modelos de dominio.
- La composición de lectura ocurre en capas server/data, no en componentes visuales.
- Cada superficie debe tener un read model coherente con su responsabilidad.

### Escritura

`UI Form -> Server Action -> Zod Schema -> Domain Rules -> Repository -> FHIR payload`

Principios:

- La UI no escribe directo a FHIR.
- Server Actions concentran la entrada de escritura desde la app.
- Zod valida shape y coherencia local.
- Las reglas de negocio viven fuera del componente visual.
- Repositorios y mappers sostienen la frontera técnica con FHIR.

## Modelo funcional objetivo

El núcleo funcional que organiza el proyecto sigue siendo:

- `Patient`
- contacto principal / quién consulta
- `ServiceRequest`
- `EpisodeOfCare`
- `Encounter`
- `Observation`
- `Condition`
- `Practitioner`

No es un intento de modelado FHIR exhaustivo. Es un recorte deliberado de lo necesario para digitalizar un flujo real de atención domiciliaria.

## Organización del código

Estructura conceptual esperada:

```text
src/
  app/
    (public)/
    admin/
  domain/
  infrastructure/
  features/
  lib/
```

Criterios:

- `app/` contiene orquestación route-local, loaders y server actions de cada superficie.
- `domain/` contiene reglas, tipos y contratos de negocio.
- `infrastructure/` contiene repositorios, mappers y cliente FHIR.
- `features/` agrupa lógica reusable de capacidades concretas cuando no pertenece a una sola ruta.
- `lib/` contiene utilidades transversales.

## Convenciones de diseño técnico

- La UI usa lenguaje de producto: por ejemplo, “visita” en lugar de imponer `Encounter` en todos los textos.
- Los nombres técnicos de FHIR se preservan en dominio e infraestructura cuando agregan precisión.
- Los componentes route-locales deben quedarse cerca de su superficie.
- No conviene extraer abstracciones prematuras si todavía no hay más de un consumidor real.

## Auth como dirección futura

La superficie privada sigue siendo mínima y transicional. Si se expone con mayor ambición en el futuro, la dirección aceptada es:

- auth mínima primero;
- preferentemente single-user al inicio;
- secretos solo server-side;
- sin `localStorage` como mecanismo principal de sesión.

Esto es dirección futura, no una afirmación sobre el estado actual.

## Testing como dirección

Prioridades vigentes:

- unit tests para reglas, mappers y helpers;
- integration tests para actions, repositorios y loaders;
- E2E solo cuando el flujo completo realmente lo justifique.

El principio sigue siendo incremental: testear lógica crítica a medida que aparece, sin exigir una infraestructura de testing sobredimensionada antes de tiempo.

## Cómo usar este documento

Usalo para:

- evaluar si una propuesta nueva respeta la dirección del proyecto;
- evitar mezclar dominio público con dominio clínico privado;
- decidir dónde debería vivir una nueva responsabilidad técnica.

No lo uses para:

- inferir estado implementado hoy;
- prometer features futuras en README o demos;
- contradecir `docs/fuente-de-verdad-operativa.md`.
