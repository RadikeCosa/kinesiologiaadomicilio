# Fuente de verdad operativa del proyecto

> Última actualización: 2026-04-14 (UTC)  
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
- `sitemap.xml` vía `src/app/sitemap.ts` y `robots.txt` vía `src/app/robots.ts`.
- Integración base de GA4 (condicional por `NEXT_PUBLIC_GA_ID`).
- Eventos custom de medición (`generate_lead`, `phone_click`, `scroll_50`, `scroll_90`).
- Verificación de Google Search Console declarada en metadata (`verification.google`).

### Parcialmente implementado
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
  - ensambla metadata/JSON-LD global derivando datos de `BUSINESS_CONFIG` y `servicesData`,
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
- `public/`: assets estáticos (`hero-image.webp`, `og-placeholder.png`).
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
- `src/app/robots.ts` expone reglas de crawl y sitemap.
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

## 8) Fuente de verdad operativa por dominio (estado actual)

### Matriz de fuentes primarias y consumidores

| Dominio | Fuente primaria actual | Consumidores principales |
| --- | --- | --- |
| Datos globales de negocio/contacto/base URL | `src/lib/config.ts` (`BUSINESS_CONFIG`) | `Header`, `Footer`, `WhatsAppButton`, `PhoneLink` |
| Catálogo de servicios | `src/app/services/data/servicesData.ts` | `ServicesGrid` / `ServiceCard` |
| Structured data (JSON-LD) | `src/app/layout.tsx` (ensamblado inline) | Script `application/ld+json` global |
| Hero editorial (H1/subtítulo/CTA) | `src/app/hero/heroContent.ts` | `hero.tsx` (consumidor) → Home (`src/app/page.tsx`) |
| Navegación global compartida (header/footer) | `src/lib/navLinks.ts` (`NAV_LINKS`) | `Header.tsx` y `Footer.tsx` |
| Variantes y tamaños de CTA | `src/components/ui/ctaStyles.ts` (`getCtaClass`) | `WhatsAppButton`, `HeroSecondaryLink`, CTA principal en Home |
| Wrapper de ancho/padding horizontal | `src/components/ui/Container.tsx` | `Header`, `Footer`, `Hero`, `Home`, `Services` |
| Patrón visual de intro de sección | `src/components/ui/styleTokens.ts` (`SECTION_TITLE_CLASS` + `SECTION_LEAD_CLASS`) | `src/app/page.tsx` (home preview) y `src/app/services/page.tsx` (`/services`) |
| Contenido editorial de intros actuales | `src/app/home/homeContent.ts` + `src/app/services/servicesPageContent.ts` | Home usa `HOME_CONTENT.servicesPreviewIntro`; `/services` usa `SERVICES_PAGE_CONTENT.intro` |
| CSS global base | `src/app/globals.css` | Carga de Tailwind global |

### Qué está centralizado hoy (y qué no)
- **Sí centralizado:** datos de contacto/base del negocio para superficies de UI en `BUSINESS_CONFIG`.
- **Sí centralizado:** catálogo del grid de servicios en `servicesData.ts`.
- **Sí centralizado:** JSON-LD global se ensambla en `layout.tsx` derivando negocio desde `BUSINESS_CONFIG` y catálogo desde `servicesData.ts`.
- **Sí centralizado:** copy editorial del hero se define en `heroContent.ts` y se consume desde `hero.tsx`.
- **Sí centralizado:** navegación global `Inicio/Servicios` se define en `NAV_LINKS` y la consumen header/footer.
- **Sí centralizado:** estilos de CTA reutilizables (variant + size + focus ring) en `getCtaClass`.
- **Sí centralizado:** wrapper presentacional mínimo `Container` para `mx-auto` + `px-4` + ancho máximo por sección.
- **Sí centralizado:** tokens visuales de intro (`title + lead`) en `styleTokens` y composición local explícita en cada página.
- **Sí centralizado por superficie:** contenido editorial de intros en `src/app/home/homeContent.ts` (Home) y `src/app/services/servicesPageContent.ts` (`/services`).
- **Nota de implementación:** `SectionIntro` fue eliminado por ser una abstracción de render demasiado pequeña; se mantiene markup explícito por página con tokens compartidos para preservar consistencia visual.
- **Sí acotado en global:** `globals.css` contiene solo el punto de entrada de Tailwind.

### Regla operativa de edición rápida
- Si cambia **contacto/base URL**, tocar primero `src/lib/config.ts` y luego verificar `src/app/layout.tsx`, `src/app/sitemap.ts` y `src/app/robots.ts`.
- Si cambia **catálogo de servicios**, tocar `src/app/services/data/servicesData.ts` y luego verificar coherencia en `Footer`, `HeroServiceTypesList` y JSON-LD en `layout.tsx`.
- Si cambia **copy editorial del hero**, tocar `src/app/hero/heroContent.ts` (y revisar `hero.tsx`/`HeroSecondaryLink.tsx` solo si cambia la estructura de render).
- Si cambia **look/jerarquía de CTAs**, tocar primero `src/components/ui/ctaStyles.ts`; luego revisar consumidores (`WhatsAppButton`, `HeroSecondaryLink`, CTA principal en Home).
- Si cambia **ancho/padding horizontal base** de secciones, tocar primero `src/components/ui/Container.tsx`.
- Si cambia **estructura/estilo del patrón visual de intro** (título + lead), tocar `src/components/ui/styleTokens.ts` y validar `src/app/page.tsx` + `src/app/services/page.tsx`.
- Si cambia **copy editorial de intros actuales** (home preview o `/services`), tocar `src/app/home/homeContent.ts` y/o `src/app/services/servicesPageContent.ts`.
- Si cambia **estilo global base**, tocar `src/app/globals.css` (sin mover estilos de componentes ahí).
- `layout.tsx` **ensambla** metadata/JSON-LD global, pero **no es fuente primaria** de negocio ni catálogo.

## 9) Decisiones de implementación ya materializadas

- Uso de **Next.js App Router** (`src/app`).
- Arquitectura de landing simple de pocas rutas.
- UI basada en utilidades Tailwind (sin librería de componentes externa).
- Integración de **GA4 directa** (sin GTM).
- Tracking centralizado en helpers (`src/lib/analytics.ts`) y componentes instrumentados.
- Uso de Metadata API de Next para SEO.
- Inyección manual de JSON-LD en layout global.
- Configuración de negocio/base URL centralizada en `BUSINESS_CONFIG` y derivada en layout/sitemap/robots.
- Navegación global compartida en `NAV_LINKS` (`src/lib/navLinks.ts`).
- Copy editorial del hero centralizada en `heroContent.ts`.

## 10) Límites y guardrails de la centralización actual

- **Mensajes de WhatsApp contextuales** se mantienen inline por intención comercial/analítica (header, hero, footer, services y por servicio).
- **Metadata editorial por ruta** se mantiene local (`layout.tsx` para global, `services/page.tsx` para `/services`) para conservar control SEO por superficie.
- **Microcopy no repetido** (párrafos o CTA únicos de una sección) se mantiene inline para evitar sobre-centralización; las intros editoriales se mantienen en content files por superficie.
- **JSON-LD global** sigue en `layout.tsx`: es consumidor técnico del dominio SEO, no repositorio maestro de negocio/servicios.
- Esta centralización es **pragmática y acotada**: no hay CMS, no hay capa i18n, no hay diccionario global de todos los strings.

### Guardrails específicos de estilos (estado actual)
- No hay **design system formal** ni librería externa de componentes UI.
- `getCtaClass` centraliza solo el patrón de CTA repetido; no todos los links/botones del sitio deben pasar por esa API.
- `Container` se mantiene como primitive compartida de layout; evitar crear nuevas primitives si solo se usan una vez.
- Mantener clases Tailwind inline en casos específicos de una sola pantalla/sección para preservar legibilidad local.
- `globals.css` se mantiene mínimo (base global): no usarlo como “segunda capa de componentes”.
- Si una clase/utilidad se repite en 2+ superficies estables y con misma semántica visual, evaluar extracción; si no, mantener inline.

## 11) Estado de validación (evidencia)

### Validación automática observada
- `npm run lint`: ejecuta correctamente, sin warnings/errores de ESLint.

### Validación automática observada (build)
- `npm run build`: ejecuta correctamente en el estado actual del repo.

### Validación manual
- No hay en el repo evidencia versionada (checklist/capturas/reportes) de validación manual de:
  - eventos GA4 en Realtime/DebugView,
  - scroll tracking en entorno desplegado,
  - operación efectiva de Search Console.

## 12) Guía operativa de mantenimiento (cierre documental)

Orden sugerido de consulta para cambios de contenido/configuración:
1. Este documento (`docs/fuente-de-verdad-operativa.md`).
2. `src/lib/config.ts` (si toca negocio/contacto/URL).
3. `src/app/services/data/servicesData.ts` (si toca catálogo de servicios).
4. `src/app/layout.tsx` (si toca metadata técnica/JSON-LD global).

Orden sugerido de consulta para cambios visuales/presentacionales:
1. `src/components/ui/ctaStyles.ts` (si toca look/size/foco de CTAs repetidos).
2. `src/components/ui/Container.tsx` (si toca gutter/ancho base compartido).
3. `src/components/ui/styleTokens.ts` (si toca patrón visual de intro repetido).
4. `src/app/home/homeContent.ts` y/o `src/app/services/servicesPageContent.ts` (si toca copy editorial de intros actuales).
5. Componente/página puntual (si el cambio es local y no repetido).
6. `src/app/globals.css` solo para base global de Tailwind.


Checklist rápido por tipo de cambio:

- **Cambio de contacto o base URL**
  1) editar `src/lib/config.ts`;
  2) alinear `metadataBase`/canonical/JSON-LD en `src/app/layout.tsx`;
  3) alinear `src/app/sitemap.ts` y `src/app/robots.ts`.

- **Cambio de catálogo de servicios**
  1) editar `src/app/services/data/servicesData.ts`;
  2) validar consistencia visual/semántica en `HeroServiceTypesList` y lista de servicios del footer;
  3) alinear `serviceType`/`hasOfferCatalog` en JSON-LD (`layout.tsx`).

- **Cambio de copy editorial del hero**
  1) editar `src/app/hero/heroContent.ts`;
  2) si impacta estructura/composición, ajustar `src/app/hero/hero.tsx` y/o `src/app/hero/components/HeroSecondaryLink.tsx`.

- **Cambio de navegación global compartida**
  1) editar `src/lib/navLinks.ts`;
  2) validar visualmente ambos consumidores (`src/components/Header.tsx` y `src/components/Footer.tsx`).

- **Cambio de estilo de CTA reutilizable**
  1) editar `src/components/ui/ctaStyles.ts`;
  2) verificar consumidores en `WhatsAppButton`, `HeroSecondaryLink` y CTA principal de Home;
  3) correr `npm run lint` y `npm run build`.

- **Cambio de composición repetida de intro**
  1) editar markup local en `src/app/page.tsx` y/o `src/app/services/page.tsx` y, si aplica, `src/components/ui/styleTokens.ts`;
  2) validar Home y `/services` para evitar drift.

## 13) Nota de cierre

Este documento deja asentado el **estado operativo actual** de centralización y sus límites. No abre nuevas fases técnicas ni propone refactors adicionales; se usa como referencia práctica para mantener consistencia en cambios futuros.

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
- `src/components/ui/ctaStyles.ts`
- `src/components/ui/Container.tsx`
- `src/components/ui/styleTokens.ts`
- `src/components/PhoneLink.tsx`
- `src/components/ScrollDepthTracker.tsx`
- `src/app/services/data/servicesData.ts`
- `src/app/hero/heroContent.ts`
- `src/lib/navLinks.ts`
- `src/app/robots.ts`
