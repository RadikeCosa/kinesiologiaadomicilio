# Fuente de verdad operativa del proyecto

> Última actualización: 2026-04-13 (UTC)  
> Alcance: estado real del repositorio `kinesiologiaadomicilio` al momento de esta revisión.

## 1) Resumen ejecutivo del proyecto

Este proyecto es hoy un **sitio web tipo landing de captación local** para un servicio profesional de kinesiología y rehabilitación a domicilio en Neuquén, Argentina.

Su objetivo operativo actual es:
- presentar el servicio,
- explicar tipos de atención ofrecida,
- y derivar contactos principalmente por **WhatsApp** (y secundariamente por teléfono).

No es, en su estado actual, una plataforma transaccional ni un sistema con gestión de turnos, autenticación o backoffice.

## 2) Estado actual del proyecto

### Implementado
- Sitio Next.js con 2 rutas públicas: inicio (`/`) y servicios (`/services`).
- Header y footer globales con navegación simple.
- CTA de WhatsApp reutilizable en múltiples secciones.
- Link telefónico instrumentado en footer.
- Metadata SEO global + metadata específica en `/services`.
- Open Graph / Twitter cards.
- JSON-LD tipo `MedicalBusiness` en layout global.
- `sitemap.xml` vía `src/app/sitemap.ts` y `robots.txt` en `public/`.
- Integración base de GA4 (condicional por `NEXT_PUBLIC_GA_ID`).
- Eventos custom de medición (`generate_lead`, `phone_click`, `scroll_50`, `scroll_90`).
- Verificación de Google Search Console declarada en metadata (`verification.google`).

### Parcialmente implementado
- Centralización de datos de negocio: existe `BUSINESS_CONFIG`, pero parte de los datos de negocio/SEO también está hardcodeada en `layout.tsx` (metadata/JSON-LD), por lo que la centralización es parcial.
- Medición analítica: el tracking está codificado, pero no hay evidencia versionada de QA operativa en entorno real (Realtime/DebugView/capturas).

### No implementado / fuera de alcance actual
- Formularios propios de contacto.
- Reserva/gestión de turnos.
- Autenticación de usuarios o panel administrativo.
- Tests automatizados.
- Pipeline CI/CD en el repo (no se observan workflows de GitHub Actions).
- Integración con GTM (la implementación actual es GA4 directo).

## 3) Stack y tecnologías (solo evidencia del repo)

- **Framework**: Next.js 15 (App Router).
- **Lenguaje**: TypeScript + React 19.
- **Estilos**: Tailwind CSS 4 + CSS global (`globals.css`).
- **Linting**: ESLint con configuración de Next.
- **Analytics**: `@next/third-parties/google` + `sendGAEvent` (GA4 directo, sin GTM).
- **SEO técnico**: Metadata API de Next, Open Graph, Twitter, JSON-LD, sitemap y robots.
- **Hosting/deploy objetivo**: inferido por URLs canónicas y metadataBase en dominio `vercel.app`.

## 4) Arquitectura real del proyecto

### Patrón general
- Aplicación con **App Router** bajo `src/app`.
- `src/app/layout.tsx` funciona como marco global de la app:
  - define metadata y viewport,
  - monta `Header` y `Footer`,
  - inyecta JSON-LD,
  - monta tracker de scroll,
  - e inyecta GA4 si existe `NEXT_PUBLIC_GA_ID`.

### Organización por dominio/página
- Home (`src/app/page.tsx`) compone hero + preview de servicios.
- Servicios (`src/app/services/page.tsx`) compone listado de servicios + CTA final.
- Módulo hero separado (`src/app/hero/*`).
- Módulo servicios separado (`src/app/services/components`, `data`, `types`).

### Capa compartida
- `src/components/`: componentes UI reutilizables (header, footer, botones, tracker, etc.).
- `src/lib/config.ts`: config de negocio y helper para enlaces WhatsApp.
- `src/lib/analytics.ts`: capa tipada de eventos analytics.

## 5) Estructura relevante del repo

Mapa orientador (no exhaustivo):

- `src/app/layout.tsx`: layout global, metadata, JSON-LD, GA4 y estructura base.
- `src/app/page.tsx`: landing principal.
- `src/app/services/page.tsx`: página de servicios.
- `src/app/sitemap.ts`: generación de sitemap.
- `src/app/hero/*`: componentes del hero de home.
- `src/app/services/data/servicesData.ts`: catálogo de servicios mostrado en UI.
- `src/components/*`: componentes reutilizables de navegación, contacto y tracking.
- `src/lib/config.ts`: datos de negocio/contacto + helper WhatsApp.
- `src/lib/analytics.ts`: funciones de tracking.
- `public/`: assets estáticos (`hero-image.webp`, `og-placeholder.png`, `robots.txt`).
- `docs/analytics-handoff.md`: estado técnico específico de analytics.

## 6) Funcionalidad actual visible

### Funcionalidad de negocio (captación/contacto)
- CTA WhatsApp en header, hero, cards de servicios, CTA final de servicios y footer.
- Link telefónico clickeable en footer (`tel:`).
- Mensajes de WhatsApp predefinidos según contexto (hero/servicios/footer).

### Funcionalidad presentacional
- Navegación interna entre inicio y servicios.
- Hero con imagen y lista de tipos de servicio.
- Grid de servicios con cards informativas.
- Botón de scroll down en home y services.
- Modo visual con clases para claro/oscuro (sin toggle explícito en UI).

### Instrumentación / observabilidad
- Eventos custom de intención de contacto y scroll.
- GA4 condicional por variable pública de entorno.
- Estructura SEO técnica base (metadata + structured data + sitemap + robots).

## 7) SEO, analítica y medición (estado actual)

### SEO on-page
- Metadata global en layout (title, description, keywords, canonical, robots, authors).
- Metadata específica de `/services` (title/description/keywords/canonical).
- Open Graph y Twitter configurados con imagen OG en `public/og-placeholder.png`.

### Structured data
- JSON-LD `MedicalBusiness` inyectado en layout global con:
  - nombre de negocio,
  - ubicación,
  - geo,
  - catálogo de servicios,
  - contacto telefónico,
  - enlace de WhatsApp.

### Indexación técnica
- `public/robots.txt` permite crawl e informa sitemap.
- `src/app/sitemap.ts` publica URLs de `/` y `/services`.

### Analytics (GA4)
- Integración directa vía `GoogleAnalytics` y `sendGAEvent`.
- Eventos implementados:
  - `generate_lead` (WhatsApp),
  - `phone_click` (teléfono),
  - `scroll_50`,
  - `scroll_90`.
- Tracking de scroll global por ruta con disparo único por umbral.

### Search Console
- Token de verificación de Google en metadata (`verification.google`).
- Estado operativo externo (propiedad activa, sitemap enviado, lectura de datos): **no verificable desde este repo**.

### Coherencia con documentación existente
- Este documento es consistente con `docs/analytics-handoff.md`.
- Para detalle fino de eventos, parámetros y límites de medición, tomar como referencia primaria ese documento.

## 8) Fuente de verdad de datos/configuración

### Fuentes de verdad actuales (parciales)
- **Contacto/base del negocio:** `src/lib/config.ts` (`BUSINESS_CONFIG`).
- **Servicios listados en UI:** `src/app/services/data/servicesData.ts`.
- **Eventos y taxonomía de tracking:** `src/lib/analytics.ts`.

### Puntos con riesgo de drift
- Datos de negocio (nombre, teléfono, ubicación, URL) también aparecen hardcodeados en `src/app/layout.tsx` dentro de metadata y JSON-LD.
- Copy de servicios está en más de un lugar (hero/footer/services data), por lo que puede desalinearse semánticamente con el tiempo.

### Regla operativa sugerida (actual)
Hasta nueva consolidación, tratar `src/lib/config.ts` como referencia primaria para contacto, y revisar `layout.tsx` en cada cambio de datos del negocio para mantener consistencia SEO/JSON-LD.

## 9) Decisiones de implementación ya materializadas

- Uso de **Next.js App Router** (`src/app`).
- Arquitectura de landing simple de pocas rutas.
- UI basada en utilidades Tailwind (sin librería de componentes externa).
- Integración de **GA4 directa** (sin GTM).
- Tracking centralizado en helpers (`src/lib/analytics.ts`) y componentes instrumentados.
- Uso de Metadata API de Next para SEO.
- Inyección manual de JSON-LD en layout global.
- Configuración parcial centralizada de negocio en `BUSINESS_CONFIG`.

## 10) Riesgos, límites y deuda visible

- **Riesgo de consistencia de datos** por duplicación entre `config.ts` y `layout.tsx`.
- **Deuda de validación analítica**: sin evidencia versionada de QA de eventos en entorno real.
- **Sin cobertura de tests automatizados**, lo que aumenta dependencia de QA manual.
- **Superficie funcional acotada** (landing), sin flujo transaccional ni formularios propios.
- **Dependencia de configuración externa** (GA4/GSC) para cerrar ciclo de medición.
- Build actual falla localmente por resolución del módulo `@next/third-parties/google` pese a figurar en dependencias (estado a revisar).

## 11) Estado de validación (evidencia)

### Validación automática observada
- `npm run lint`: ejecuta correctamente, sin warnings/errores de ESLint.

### Validación automática con falla
- `npm run build`: falla por `Module not found: Can't resolve '@next/third-parties/google'` en `layout.tsx` y `analytics.ts`.

### Validación manual
- No hay en el repo evidencia versionada (checklist/capturas/reportes) de validación manual de:
  - eventos GA4 en Realtime/DebugView,
  - scroll tracking en entorno desplegado,
  - operación efectiva de Search Console.

## 12) Guía mínima para futuros cambios

Antes de cambiar, revisar en este orden:
1. `README.md` (estado general del proyecto).
2. `docs/analytics-handoff.md` (si el cambio toca medición).
3. Este documento (visión operativa integrada).

Si cambia contacto/negocio:
- actualizar `src/lib/config.ts`,
- revisar y ajustar metadata + JSON-LD en `src/app/layout.tsx`,
- validar links de WhatsApp/teléfono en header/footer/hero/services.

Si cambia tracking:
- tocar `src/lib/analytics.ts`,
- revisar uso en `WhatsAppButton`, `PhoneLink`, `ScrollDepthTracker`,
- confirmar nombres de eventos/parámetros para no romper reportes.

Si cambia SEO:
- revisar `layout.tsx` + metadata de ruta (`/services`),
- revisar `src/app/sitemap.ts` y `public/robots.txt` si hay rutas nuevas.

## 13) Próximos pasos razonables (documentales/operativos)

1. Documentar una matriz única de datos de negocio (qué campo vive en `config.ts` y dónde se replica en metadata/JSON-LD).
2. Incorporar evidencia versionada mínima de QA de analytics (capturas o checklist por evento).
3. Definir procedimiento operativo de Search Console (propiedad, envío sitemap, revisión periódica).
4. Registrar convención de naming de eventos y parámetros GA4 para evitar drift futuro.
5. Resolver y documentar la causa de la falla de build para restablecer baseline técnico verificable.

---

## Fuentes internas usadas para esta consolidación

- `README.md`
- `docs/analytics-handoff.md`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/services/page.tsx`
- `src/app/sitemap.ts`
- `src/lib/config.ts`
- `src/lib/analytics.ts`
- `src/components/WhatsAppButton.tsx`
- `src/components/PhoneLink.tsx`
- `src/components/ScrollDepthTracker.tsx`
- `src/app/services/data/servicesData.ts`
- `public/robots.txt`
