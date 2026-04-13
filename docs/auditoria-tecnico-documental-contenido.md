Auditoría técnico-documental del contenido actual (estado real del repo)

A continuación te dejo un relevamiento 100% basado en archivos reales del repositorio, sin implementar cambios.

## 1) Inventario completo de fuentes actuales de contenido

Criterio: incluyo fuentes que contienen copy visible, datos de negocio/contacto, catálogo de servicios, metadata/SEO y structured data.

### A. Configuración de negocio/contacto (dato reusable)

- `src/lib/config.ts`

    - Propósito: centralizar datos del negocio y helper para links de WhatsApp.
    - Contenido: nombre, nombre corto, teléfono, teléfono limpio, ubicación (ciudad/región/país/coordenadas), URL base, y `getWhatsAppUrl`.
    - Rol: source of truth claro para contacto/base de negocio (parcial respecto SEO porque `layout` no deriva de acá).
    - Consumidores actuales: `Header`, `Footer`, `WhatsAppButton`.

### B. Catálogo de servicios (dato reusable)

- `src/app/services/data/servicesData.ts`

    - Propósito: dataset de servicios para cards de la página `/services`.
    - Contenido: `title`, `description`, `icon`, `whatsappMessage` para 4 servicios.
    - Rol: source of truth de facto para el grid/cards de servicios.
    - Consumidores actuales: `ServicesGrid` → `ServiceCard`.

### C. Copy/presentación de páginas (inline en JSX)

- `src/app/page.tsx` (home)

    - Propósito: estructura home + preview “Nuestros Servicios”.
    - Contenido: heading/subheading de preview y CTA “Ver todos los servicios”.
    - Rol: consumo/presentación; no centralizado.
    - Dependencias: usa `HeroSection` y `ScrollDownButton`, pero el copy del preview está inline.

- `src/app/services/page.tsx`

    - Propósito: página de servicios.
    - Contenido: copy editorial de intro, CTA final, metadata específica de ruta.
    - Rol: mezcla presentación + SEO de ruta; no centralizado.
    - Dependencias: `ServicesGrid`, `WhatsAppButton`.

- `src/app/hero/hero.tsx`

    - Propósito: hero principal home.
    - Contenido: H1, texto de apoyo, mensaje WhatsApp, CTA label.
    - Rol: presentación/copy editorial inline.
    - Dependencias: `WhatsAppButton`, `HeroSecondaryLink`, `HeroServiceTypesList`, `HeroImage`.

- `src/app/hero/components/HeroServiceTypesList.tsx`

    - Propósito: lista breve de tipos de servicio en hero.
    - Contenido: array inline items (labels de servicios abreviados).
    - Rol: presentación; duplicación semántica con catálogo de servicios.
    - Dependencias: usado por `hero.tsx`.

- `src/app/hero/components/HeroSecondaryLink.tsx`

    - Propósito: CTA secundario “Ver servicios”.
    - Contenido: label inline.
    - Rol: presentación.
    - Dependencias: usado por `hero.tsx`.

### D. Navegación/CTA globales

- `src/components/Header.tsx`

    - Propósito: nav principal + CTA contacto.
    - Contenido: labels nav (“Inicio”, “Servicios”), CTA “Contactar/WhatsApp”, mensaje WhatsApp inline.
    - Rol: presentación + CTAs; parcialmente derivado de config (solo `shortName`).
    - Dependencias: `BUSINESS_CONFIG`, `WhatsAppButton`.

- `src/components/Footer.tsx`

    - Propósito: contacto, navegación, lista resumida de servicios.
    - Contenido: contacto derivado de config, navegación inline, lista de servicios inline, CTA WhatsApp inline.
    - Rol: mixto; contacto sí deriva, servicios no.
    - Dependencias: `BUSINESS_CONFIG`, `PhoneLink`, `WhatsAppButton`.

### E. SEO global + structured data

- `src/app/layout.tsx`

    - Propósito: metadata global, JSON-LD MedicalBusiness, shell global.
    - Contenido: título, descripción, OG/Twitter, keywords, canonical, verificación Google, JSON-LD con negocio + catálogo + contacto.
    - Rol: source of truth SEO global actual, pero hardcodeado y separado de `config.ts`.
    - Dependencias: monta `Header` y `Footer`; no importa `BUSINESS_CONFIG`.

- `src/app/sitemap.ts` y `public/robots.txt`

    - Propósito: indexación técnica.
    - Contenido: base URL hardcodeada y rutas sitemap.
    - Rol: fuente técnica SEO; separada de config/layout.
    - Dependencias: ninguna directa.

## 2) Clasificación por dominio de contenido + riesgo de drift
## 3) Duplicaciones reales detectadas

_(Te los junto porque están fuertemente ligados.)_

### Dominio: datos globales del negocio / contacto

- Dónde vive hoy: `config.ts` + strings repetidas en `layout.tsx` JSON-LD/metadata + `sitemap.ts`/`robots.txt`.
- Centralización: parcial.
- Fuente primaria clara: para UI/contacto: `config.ts`; para SEO global hoy: `layout.tsx`.
- Riesgo: alto (múltiples fuentes).

#### Duplicaciones concretas

- **Nombre del negocio**
    - `BUSINESS_CONFIG.name` vs JSON-LD `name` en `layout`.
    - Tipo: literal.
    - Archivos: `config.ts` / `layout.tsx`.
    - Riesgo práctico: si cambiás naming comercial, UI y schema pueden divergir.

- **Teléfono / WhatsApp**
    - `config.ts` (`phone`, `phoneClean`) vs JSON-LD `contactPoint.telephone` y `sameAs` con `wa.me`.
    - Tipo: literal/parcial.
    - Archivos: `config.ts` / `layout.tsx`.
    - Riesgo: contacto visible y datos estructurados inconsistentes.

- **Ubicación / geo**
    - `config.ts.location` vs `address/geo/areaServed` en JSON-LD.
    - Tipo: literal/parcial.
    - Archivos: `config.ts` / `layout.tsx`.
    - Riesgo: drift SEO local.

- **URL canónica/base**
    - `config.ts.url` vs `metadataBase`, `canonical`, `openGraph.url`, JSON-LD `@id/url/image/logo`, `sitemap.ts` base, `robots` sitemap.
    - Tipo: literal multiarchivo.
    - Archivos: `config.ts`, `layout.tsx`, `sitemap.ts`, `robots.txt`.
    - Riesgo: alto; un cambio de dominio exige tocar muchos lugares.

### Dominio: catálogo de servicios

- Dónde vive hoy: `servicesData.ts` (completo para cards), pero también footer, hero list y JSON-LD tienen versiones propias.
- Centralización: disperso.
- Fuente primaria clara: sí para página `/services` (cards), no para resto de superficies.
- Riesgo: alto.

#### Duplicaciones concretas

1) **Servicios en `servicesData.ts` vs footer**
    - Ej.: “Rehabilitación post-operatoria”, “Adultos mayores”, “Cuidados paliativos”, “Terapia física general”.
    - Tipo: semántica (no siempre misma capitalización/forma).
    - Archivos: `servicesData.ts` / `Footer.tsx`.
    - Riesgo: el footer puede quedar desactualizado al editar catálogo.

2) **Servicios en `servicesData.ts` vs JSON-LD `serviceType` + `hasOfferCatalog`**
    - Nombres y descripciones muy similares, no derivados.
    - Tipo: parcial/semántica.
    - Archivos: `servicesData.ts` / `layout.tsx`.
    - Riesgo: SEO schema puede divergir del contenido real de la página.

3) **Servicios en `servicesData.ts` vs `HeroServiceTypesList`**
    - Hero usa lista abreviada (items) con “Rehab post-operatoria”, “Adultos mayores”, etc.
    - Tipo: semántica.
    - Archivos: `servicesData.ts` / `HeroServiceTypesList.tsx`.
    - Riesgo: mensaje comercial inconsistente entre hero y catálogo.

### Dominio: navegación principal / labels globales

- Dónde vive hoy: header y footer por separado.
- Centralización: no.
- Fuente primaria clara: no.
- Riesgo: medio (pocas entradas, pero duplicadas).

#### Duplicación concreta

8) **Labels de nav “Inicio” / “Servicios”**
    - Tipo: literal.
    - Archivos: `Header.tsx` / `Footer.tsx`.
    - Riesgo: cambios de nomenclatura desalineados.

### Dominio: CTA labels y mensajes WhatsApp

- Dónde vive hoy: inline por componente/página.
- Centralización: no.
- Fuente primaria clara: no.
- Riesgo: medio-alto (copy drift y tracking labels inconsistentes).

#### Duplicaciones/variaciones

9) **Mensajes de WhatsApp similares pero distintos por superficie**
    - Header: “consultar por kinesio a domicilio”.
    - Hero: “consultar por una sesión...”.
    - Footer: “consultar sobre kinesiología a domicilio”.
    - Services page: “consultar sobre los servicios...”.
    - Services data: uno por servicio.
    - Tipo: semántica (intencional parcial, pero sin convención central).
    - Archivos: `Header.tsx`, `hero.tsx`, `Footer.tsx`, `services/page.tsx`, `servicesData.ts`.
    - Riesgo: tono inconsistente + analytics difícil de comparar por variación de labels/mensajes.

    - Labels CTA parecidos para ir a servicios: “Ver servicios” (hero) vs “Ver todos los servicios” (home preview).
    - Tipo: parcial.
    - Archivos: `HeroSecondaryLink.tsx` / `page.tsx`.

### Dominio: copy SEO / metadata

- Dónde vive hoy: `layout.tsx` (global) + `services/page.tsx` (ruta).
- Centralización: razonable por convención Next, pero no derivada de config de negocio.
- Fuente primaria clara: sí (cada segmento en su archivo de metadata).
- Riesgo: medio.

### Dominio: structured data / JSON-LD

- Dónde vive hoy: `layout.tsx` inline.
- Centralización: no derivado desde config/servicesData.
- Fuente primaria clara: sí (layout), pero aislada.
- Riesgo: alto por duplicar negocio y servicios ya definidos en otros módulos.

## 4) Evaluación específica de `src/app/services/data/servicesData.ts`

### Qué resuelve bien hoy

- Resuelve bien el catálogo UI de `/services`: título, descripción, icono y mensaje WhatsApp por servicio.
- Tiene tipado asociado (`Service`) y consumidor único claro (`ServicesGrid`/`ServiceCard`).

### Qué usos actuales podría abastecer sin cambios conceptuales

- Lista resumida del footer (nombres).
- Lista de tipos del hero (labels).
- `serviceType` y `OfferCatalog` del JSON-LD (nombres + descripciones).
- Eventualmente SEO keywords de servicios por ruta (si se quiere consistencia semántica).

### Qué no cubre bien todavía

- No incluye slug/id estable.
- No distingue “label corto” vs “label largo” (hero/footer/schema).
- No tiene campos SEO específicos (si se necesitaran matices de wording).

### Recomendación puntual

- Sí conviene fortalecer este archivo existente como base única de dominio servicios.
- No conviene crear ahora un “services copy file” separado: sería abrir otra fuente y aumentar drift en esta etapa.

## 5) Evaluación específica del hero

### Textos enterrados en JSX

- H1 principal, subtítulo, sr-only, CTA “Hacé tu consulta”, mensaje WA, y link “Ver servicios” están inline en `hero.tsx`/`HeroSecondaryLink.tsx`.
- Lista de tipos de servicio en array inline items dentro de `HeroServiceTypesList`.

### Qué pertenece a “copy editorial del hero”

- H1, subtítulo, texto de apoyo, CTA principal/secundario.

### Qué pertenece a “catálogo de servicios”

- La lista de tipos (aunque abreviada) pertenece semánticamente al dominio servicios.

### Recomendación

- Sí, el hero merece separar su copy editorial en un `heroContent` mínimo.
- La parte de tipos/servicios del hero debería derivar del dominio servicios (no quedar manual en componente).
- Riesgo si no se centraliza antes de editar copy: alto riesgo de inconsistencias entre hero, grid, footer y JSON-LD.

## 6) Evaluación de header, footer y structured data

### Header

- Duplica labels de navegación con footer (“Inicio”, “Servicios”).
- Tiene copy CTA y mensaje WA hardcodeados.
- Solo el nombre corto deriva de `BUSINESS_CONFIG`.

### Footer

- Contacto sí deriva de config (bien).
- Servicios del footer están hardcodeados (no derivan de `servicesData`).
- Duplicación semántica clara con catálogo principal.

### Structured data (`layout.tsx`)

- Duplica negocio/contacto/ubicación/url y catálogo de servicios manualmente.
- No deriva de `config.ts` ni `servicesData.ts`.
- Metadata y JSON-LD están “alineados en intención”, pero técnicamente pueden divergir porque son bloques manuales separados (y ambos separados de config).

## 7) Fuente de verdad recomendada por dominio (mínima y pragmática)

- **Negocio/contacto**: conservar `src/lib/config.ts` como primaria.
- **Servicios**: conservar y fortalecer `src/app/services/data/servicesData.ts` como primaria.
- **Hero editorial**: consolidar en archivo de contenido propio (mínimo), separado del catálogo.
- **Navegación/header-footer labels**: consolidar en una pequeña fuente compartida (`const` simple), no arquitectura nueva.
- **SEO global**: conservar metadata en `layout.tsx` (convención Next), pero derivar campos repetidos de `config` cuando aplique.
- **Structured data**: mantener en `layout.tsx` como ubicación, pero derivar negocio/servicios desde fuentes existentes.
- **CTA labels/mensajes comunes**: consolidar solo los que son globales/repetidos; dejar mensajes por servicio donde tenga sentido contextual.

### Qué conservaría

- `config.ts` y `servicesData.ts` como núcleos de dominio.
- Ubicación de metadata por ruta (`layout.tsx` y `services/page.tsx`) por convención de framework.

Qué consolidaría

    Servicios en footer/hero/schema.

    Nav labels header/footer.

    Algunos textos CTA repetidos.

Qué NO tocaría todavía

    No crear CMS, i18n ni capa de abstracción grande.

    No sobrecentralizar cada string aislado de una sola superficie.

8) Secuencia mínima recomendada (para futura implementación)

    Eliminar drift de servicios en superficies secundarias
    (footer + hero types + JSON-LD service catalog).

    Alinear datos de negocio SEO/JSON-LD con config.ts
    (name, phone, location, url).

    Unificar labels globales de navegación y CTA repetidos
    (header/footer y CTAs duplicados).

    Extraer copy editorial del hero
    (sin mezclarlo con catálogo).

    Revisión final de metadata vs JSON-LD
    para garantizar consistencia semántica.

9) Riesgos y límites

    Zonas claras:

        config.ts ya funciona bien como base de contacto/UI.

        servicesData.ts ya funciona bien para cards del catálogo.

    Ambigüedad semántica:

        Algunos mensajes de WhatsApp distintos pueden ser intencionales por contexto (no toda diferencia es error).

    “Duplicación” con propósito distinto:

        Metadata y texto visible no deben ser idénticos palabra por palabra; sí deben ser coherentes.

    Qué no centralizar aún:

        Strings de microcopy únicos de una sola pantalla que no se reutilizan.


