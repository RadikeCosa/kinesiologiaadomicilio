# Reorganización de layouts y navegación pública/privada (App Router)

> Estado: implementado en código
> Última actualización: 2026-04-17 (UTC)

## 1) Motivación del cambio

La app necesitaba separar responsabilidades de shell entre:

- la superficie pública de captación (`/`, `/services`, `/evaluar`), y
- la superficie privada mínima/transicional (`/admin/*`).

Antes, esa separación no estaba explícita a nivel de layouts. Con App Router, la forma más estable de resolverlo fue distribuir responsabilidades por route groups/layouts en vez de condicionar UI por pathname.

## 2) Estructura final de layouts (estado actual)

```text
src/app/
  layout.tsx                 -> root layout mínimo (cross-app)
  (public)/
    layout.tsx               -> shell pública (header/footer + SEO público)
    page.tsx                 -> /
    services/page.tsx        -> /services
    evaluar/page.tsx         -> /evaluar
  admin/
    layout.tsx               -> shell privada de /admin/*
    components/
      AdminNavLink.tsx       -> links con estado activo exact/branch
```

### Qué cambió concretamente

- `src/app/layout.tsx` quedó simplificado y ya **no** inyecta header/footer públicos.
- `src/app/(public)/layout.tsx` encapsula la shell pública.
- `src/app/admin/layout.tsx` encapsula la shell privada de `/admin/*`.
- Las páginas públicas se movieron a `src/app/(public)/**` sin cambiar URLs públicas.

## 3) Responsabilidades por layout

### 3.1 `src/app/layout.tsx` (root)

Responsabilidad **global y transversal**:

- `<html>` / `<body>` base,
- estilos globales,
- metadata base e íconos,
- Google Analytics condicionado por `NEXT_PUBLIC_GA_ID`.

No incluye decisiones de navegación pública ni privada.

### 3.2 `src/app/(public)/layout.tsx`

Responsabilidad de **shell pública**:

- skip link a `#contenido`,
- `Header` público,
- `Footer` público,
- `ScrollDepthTracker`,
- JSON-LD `MedicalBusiness`,
- metadata SEO/OG/Twitter orientada a landing pública.

### 3.3 `src/app/admin/layout.tsx`

Responsabilidad de **shell privada** para `/admin/*`:

- header propio con brand de administración,
- navegación mínima de admin acotada a rutas reales (`/admin/patients`, `/admin/patients/new`),
- contenedor visual de contenido privado.

## 4) Regla de separación de dominios

- **Dominio público**: captación, contenido comercial/editorial, SEO público, contacto.
- **Dominio privado (`/admin/*`)**: superficie mínima transicional para gestión clínica inicial.

La separación puede reutilizar lenguaje visual (tokens, componentes base), pero **no** debe mezclar responsabilidades, navegación ni semántica de producto entre dominios.

## 5) Decisiones de navegación y su justificación

### 5.1 No reutilizar header de landing en `/admin`

Se evitó reutilizar el header público dentro de admin para no:

- mezclar navegación de marketing con flujo privado,
- exponer rutas públicas como navegación principal en contexto administrativo,
- acoplar evolución del admin al copy/IA del sitio público.

### 5.2 Separación por route groups/layouts (no condicional por pathname)

Se eligió separar por `app/(public)/layout.tsx` y `app/admin/layout.tsx` porque:

- hace explícitas las fronteras de dominio en estructura de carpetas,
- reduce condicionales de runtime por pathname,
- simplifica mantenimiento y lectura técnica,
- disminuye riesgo de regresiones al crecer rutas públicas o privadas.

### 5.3 Navegación de admin acotada a rutas reales

El nav de admin quedó limitado a rutas implementadas hoy. No se agregaron entradas para rutas futuras no existentes.

`AdminNavLink` agrega estado activo configurable:

- `match="exact"` para coincidencia exacta,
- `match="branch"` para una rama (`href` y subrutas).

## 6) Estabilidad de imports y datos compartidos (`servicesData`)

`servicesData` vive en `src/lib/servicesData.ts` y no dentro de `app/(public)`.

Motivo: evitar imports frágiles desde estructura route-local cuando el dato también es consumido por componentes compartidos o metadata/SEO que no deberían depender de una ruta específica.

Consumidores actuales relevantes:

- footer compartido,
- lista de tipos en hero,
- grid de servicios,
- JSON-LD de layout público.

## 7) Decisiones intencionalmente NO tomadas

Para mantener el cambio acotado al estado real:

- no se creó un sistema genérico de navegación multi-dominio,
- no se agregaron rutas de admin futuras en el menú,
- no se mezcló navegación pública dentro de `/admin`,
- no se presentó `/admin` como superficie clínica productiva completa,
- no se introdujeron refactors de producto fuera de la reorganización de layouts/imports.

## 8) Guía breve de mantenimiento futuro

### Dónde ubicar una nueva preocupación global

Va en `src/app/layout.tsx` solo si aplica a **toda** la app (pública y privada), por ejemplo: estructura HTML base, estilos globales, instrumentación transversal.

### Cuándo algo debe ir en `src/app/(public)/layout.tsx`

Cuando la preocupación sea propia de experiencia pública: shell comercial, SEO público, tracking de superficie pública, navegación y footer de landing.

### Cuándo algo debe ir en `src/app/admin/layout.tsx`

Cuando la preocupación afecte solo a `/admin/*`: navegación privada, jerarquía visual administrativa, contexto de uso profesional.

### Cómo evitar reintroducir imports frágiles desde rutas

- Si un dato/componente se reutiliza entre superficies o entre route-local y shared, ubicarlo fuera de `app/**` (por ejemplo `src/lib`, `src/components`, `src/domain`).
- Reservar `app/**` para orquestación route-local.

## 9) Alcance explícito del estado actual

- La landing pública sigue siendo la superficie principal del repositorio.
- `/admin/*` sigue siendo una superficie privada mínima/transicional.
- Este documento describe estado implementado; no funciona como roadmap.
