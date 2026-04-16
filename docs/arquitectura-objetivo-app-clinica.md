# Arquitectura objetivo mínima — futura app clínica conviviente

> Estado: dirección técnica objetivo (no implementación vigente)
> Fecha: 2026-04-16 (UTC)

## 1) Propósito del documento

La landing pública actual se mantiene como superficie activa del proyecto.

Este documento define la arquitectura objetivo mínima de la futura app clínica conviviente en el mismo repositorio.

No reemplaza la fuente de verdad operativa ni el plan por fases. Tampoco implica que esta arquitectura ya exista implementada.

## 2) Separación de dominios

La convivencia en un mismo repo no implica mezclar dominios. La dirección esperada separa tres superficies:

### A. Landing pública

- `/`
- `/services`
- `/evaluar`

### B. App clínica privada del profesional

- Superficie bajo `/admin/...`
- Foco inicial: flujo clínico profesional (pacientes, tratamiento activo, visitas, historial básico)

### C. Portal futuro

- `/portal`
- Evolución posterior; no foco inicial de implementación

Regla de diseño: estos dominios pueden compartir repositorio, pero deben mantenerse conceptualmente desacoplados en objetivos, lenguaje y responsabilidades.

## 3) Rutas objetivo mínimas

Como base mínima de arquitectura privada, se esperan las siguientes rutas:

- `/admin/patients`
- `/admin/patients/[id]`
- `/admin/patients/[id]/encounters`
- `/admin/patients/[id]/encounters/[encounterId]`

Nota: podrán existir más rutas privadas a futuro, pero estas constituyen la base mínima esperada para el flujo profesional inicial.

## 4) Modelo funcional mínimo

Mapa conceptual mínimo esperado para la futura app clínica:

- `Patient`: identidad clínica base del caso.
- Contacto principal / quién escribe: canal y rol de contacto operativo.
- `EpisodeOfCare`: tratamiento activo y su marco temporal/estado.
- `Encounter`: visita/encuentro clínico.
- `Observation`: observaciones registrables durante el seguimiento.
- `Procedure`: acciones/intervenciones realizadas.

Este mapa no pretende fijar modelado FHIR exhaustivo; define solo la base funcional mínima para diseño y consistencia.

## 5) Arquitectura objetivo de lectura

Dirección arquitectónica de lectura:

`FHIR Server -> FHIR Client -> Repository -> Mapper -> Domain Model -> Route data loader -> UI`

Reglas operativas:

- FHIR no debe cruzar crudo a la UI.
- La UI consume modelos de dominio o read models.
- La composición de lectura ocurre en capas server/data, no en componentes visuales.
- Cada surface consume un read model coherente con su responsabilidad (listado, detalle, historial, etc.).

## 6) Arquitectura objetivo de escritura

Dirección arquitectónica de escritura:

`UI Form -> Server Action -> Zod Schema -> Domain Rules -> Write Repository -> Inverse Mapper -> FHIR Client -> FHIR Server`

Reglas operativas:

- La UI no escribe directo a FHIR.
- La Server Action es la entrada única de escritura desde UI.
- Zod valida shape y coherencia local de entrada.
- Domain Rules valida reglas de negocio.
- Repository ejecuta persistencia.
- Inverse Mapper arma payload compatible con FHIR.
- FHIR Client ejecuta operación y valida respuesta técnica básica.

## 7) Estructura objetivo de carpetas

Estructura mínima orientativa:

```text
src/
  app/
    (public)/
      page.tsx
      services/page.tsx
      evaluar/page.tsx
    admin/
      patients/
        page.tsx
        data.ts
        actions/
      patients/[id]/
        page.tsx
        data.ts
        actions/
      patients/[id]/encounters/
        page.tsx
        data.ts
        actions/
      patients/[id]/encounters/[encounterId]/
        page.tsx
        data.ts
        actions/
  domain/
    patient/
    episode-of-care/
    encounter/
    rules/
  infrastructure/
    repositories/
    mappers/
  lib/
    fhir/
    auth/
```

Criterio de ubicación:

- En `app/...` vive lo route-local (orquestación de ruta, loaders de lectura, acciones de escritura de la superficie).
- Fuera de `app/...` vive lo reusable de dominio/infraestructura (reglas, repositorios, mappers, cliente FHIR, utilidades de auth).

## 8) Convenciones de organización

Reglas operativas recomendadas:

- UI usa lenguaje de producto (por ejemplo, “visita”); dominio/FHIR conserva nombres técnicos (`Encounter`).
- `page.tsx` orquesta la ruta y delega lógica.
- `data.ts` compone lectura y entrega read models.
- `actions/` encapsula escritura vía Server Actions.
- `*.schema.ts` concentra validación con Zod.
- Componentes route-locales se ubican cerca de su ruta.
- Componentes realmente compartidos van fuera de la ruta (por ejemplo en `src/components/` u otra carpeta común definida).

## 9) Auth mínima transicional (V2)

Dirección técnica mínima para exponer rutas privadas en producción:

- Se requiere auth mínima antes de considerar operativa la superficie privada.
- Primer esquema aceptado: single-user.
- Middleware + cookie `httpOnly` como estrategia transicional.
- Credenciales basadas en variables de entorno como punto de partida.
- Debe diseñarse de forma reemplazable por un esquema más robusto.
- No usar secretos en cliente ni `localStorage` como mecanismo principal de sesión.

Nota: librerías y detalles de implementación se definen en documentación técnica específica cuando corresponda.

## 10) Estrategia de testing objetivo

### A. Unit tests

Cobertura prioritaria para:

- domain rules
- mappers
- formatters/helpers
- auth helpers mínimos

### B. Integration tests

Cobertura prioritaria para:

- server actions
- repositories
- loaders / data composition

### C. E2E

Cuando exista flujo mínimo completo, cubrir:

- login
- alta de paciente
- tratamiento activo
- registro de visita
- consulta básica

## 11) Momento de entrada del testing

- No esperar al final del proyecto para empezar a testear.
- Tampoco frenar el arranque por exigir cobertura total desde día uno.
- Comenzar por lógica crítica a medida que aparezca.
- Exigir mayor integración y E2E al cierre de V1/V2.

## 12) Alcance y límites del documento

Este documento define arquitectura objetivo mínima.

No describe implementación actual ni debe leerse como estado vigente del repositorio.

ADRs o documentos técnicos más específicos podrán refinar estas decisiones sin contradecir el encuadre de producto.

No reemplaza la documentación operativa ni el plan por fases; funciona como guía técnica intermedia para implementación futura.
