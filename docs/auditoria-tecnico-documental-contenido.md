# Auditoría técnico-documental del contenido — reencuadre histórico + estado vigente

> Nota editorial (2026-04-14): este archivo nació como auditoría de drift en un estado previo.  
> Desde entonces hubo implementación efectiva en código.  
> Esta versión se mantiene como **auditoría histórica corregida** para no inducir decisiones operativas erróneas.

## 1) Qué sigue vigente de la auditoría original

- Sigue siendo válido que `config.ts` es fuente primaria de datos de negocio/contacto.
- Sigue siendo válido que `servicesData.ts` es fuente primaria del catálogo de servicios.
- Sigue siendo válido que el proyecto prioriza una centralización pragmática (sin CMS ni sobre-abstracción).

## 2) Correcciones operativas obligatorias (estado real actual)

### A) `layout.tsx` sí deriva de fuentes compartidas
Corrección:
- `layout.tsx` **sí** importa y usa `BUSINESS_CONFIG`.
- `layout.tsx` **sí** importa y usa `servicesData` para armar `serviceType` y `hasOfferCatalog` del JSON-LD.

Implicancia:
- Ya no corresponde afirmar que SEO/JSON-LD está totalmente hardcodeado y aislado de fuentes de dominio.

### B) `robots.ts` y `sitemap.ts` no están hardcodeados en dominio
Corrección:
- Ambos consumen `BUSINESS_CONFIG.url`.

Implicancia:
- Cambio de dominio/base URL tiene un punto de verdad técnico claro en `config.ts`, con consumidores en layout/sitemap/robots.

### C) Footer no mantiene servicios manuales
Corrección:
- Footer deriva la lista de servicios desde `servicesData`.

Implicancia:
- El drift footer vs catálogo principal quedó mitigado en la implementación actual.

### D) HeroServiceTypesList no usa array inline manual
Corrección:
- `HeroServiceTypesList` deriva ítems desde `servicesData` y usa `shortTitle` opcional.

Implicancia:
- Hero y catálogo comparten fuente de dominio para tipos de servicio.

### E) Header y Footer sí comparten fuente de navegación
Corrección:
- La navegación global compartida vive en `src/lib/navLinks.ts` (`NAV_LINKS`).
- Header y Footer consumen esa fuente.

Implicancia:
- Ya no corresponde indicar que los labels `Inicio/Servicios` están duplicados sin fuente común.


### F) Intros de sección: composición local + contenido por superficie
Corrección:
- `SectionIntro` fue eliminado por ser una abstracción de render demasiado pequeña.
- El patrón visual de título + lead se mantiene con `SECTION_TITLE_CLASS` y `SECTION_LEAD_CLASS` en `src/components/ui/styleTokens.ts`.
- El copy editorial se mantiene centralizado por superficie: Home en `src/app/home/homeContent.ts` y `/services` en `src/app/services/servicesPageContent.ts`.

Implicancia:
- Ya no corresponde afirmar que existe una fuente compartida genérica para intros; la centralización se mantiene, pero por superficie.

### G) Home incorpora sección editorial “Cómo funciona” con fuente dedicada
Corrección:
- Home ahora compone explícitamente `HeroSection` + `AboutSection` + `HowItWorksSection` + bloque preview/contexto de servicios.
- El contenido editorial de “Cómo funciona” vive en `src/app/home/howItWorksContent.ts` y se renderiza desde `src/app/home/components/HowItWorksSection.tsx`.

Implicancia:
- La centralización editorial del Home no se limita a hero + intro de preview; también cubre el bloque operativo “Cómo funciona” con fuente explícita por sección.

## 3) Estado actual por dominio (resumen útil)

- **Negocio/contacto/base URL:** `src/lib/config.ts`.
- **Catálogo de servicios:** `src/app/services/data/servicesData.ts`.
- **Navegación global (`Inicio`/`Servicios`):** `src/lib/navLinks.ts`.
- **Hero editorial:** `src/app/hero/heroContent.ts`.
- **How it works editorial (Home):** `src/app/home/howItWorksContent.ts`.
- **SEO/JSON-LD global:** `src/app/layout.tsx` como ensamblador, derivando de `config.ts` + `servicesData.ts`.
- **Intros de sección (patrón + copy actual):** composición local en cada página, tokens en `src/components/ui/styleTokens.ts` y contenido editorial por superficie (`homeContent.ts` / `servicesPageContent.ts`).

## 4) Uso recomendado de este archivo

- Usar este documento como referencia histórica de cómo se detectó drift.
- Para operación actual, priorizar:
  1. `docs/fuente-de-verdad-operativa.md`
  2. `docs/analytics-handoff.md`
  3. código fuente vigente.
