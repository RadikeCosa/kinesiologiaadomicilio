# Plan de implementación de fixes de contenido

> Estado de actualización: 2026-04-14 (UTC)
> Tipo de documento: plan vivo con trazabilidad de ejecución.

## Resumen ejecutivo

Este plan se mantiene como guía por fases, pero **ya no representa un backlog íntegramente pendiente**. A la fecha:

- Fase 1: ✅ completa.
- Fase 2: ✅ completa en el alcance definido.
- Fase 3: ✅ completa en el alcance técnico base.
- Fase 4: ✅ completa.
- Fase 5: 🟨 parcialmente completa (remanente opcional de higiene).

---

## Fase 1 — Consolidar catálogo de servicios en superficies secundarias

**Estado actual:** ✅ Completa

**Objetivo original**  
Eliminar drift de servicios fuera del grid principal, usando `servicesData.ts` como fuente primaria única del dominio servicios.

**Qué se implementó**
- Footer deriva lista de servicios desde `servicesData`.
- `HeroServiceTypesList` deriva ítems desde `servicesData` (incluyendo `shortTitle` cuando aplica).

**Criterio de cierre (cumplido)**
- El catálogo visible en `/services`, footer y hero deriva del mismo origen.

---

## Fase 2 — Derivar structured data de fuentes existentes (servicios + negocio)

**Estado actual:** ✅ Completa en el alcance planteado

**Objetivo original**  
Reducir drift SEO estructurado: que JSON-LD no replique manualmente servicios/negocio ya existentes en `servicesData.ts` y `config.ts`.

**Qué se implementó**
- JSON-LD en `layout.tsx` deriva `serviceType` y `hasOfferCatalog` desde `servicesData`.
- JSON-LD deriva `name`, `telephone`, `address`, `geo`, `url` y `sameAs` desde `BUSINESS_CONFIG`.

**Criterio de cierre (cumplido)**
- Cambios en catálogo o contacto impactan JSON-LD sin duplicación manual relevante.

---

## Fase 3 — Alinear metadata global y datos técnicos de URL/base

**Estado actual:** ✅ Completa en el alcance técnico base

**Objetivo original**  
Disminuir drift entre metadata/canonical/base URL/sitemap/robots y datos de negocio base.

**Qué se implementó**
- `metadataBase` y `canonical` global usan `BUSINESS_CONFIG.url`.
- `sitemap.ts` y `robots.ts` usan `BUSINESS_CONFIG.url`.

**Criterio de cierre (cumplido en alcance base)**
- Base URL/canonical/sitemap/robots quedan alineados con un único punto de edición lógico (`config.ts`).

---

## Fase 4 — Separar hero editorial del dominio servicios (`heroContent`)

**Estado actual:** ✅ Completa

**Objetivo original**  
Ordenar el hero como dominio editorial propio sin mezclarlo con catálogo.

**Qué se implementó**
- Copy editorial del hero centralizada en `src/app/hero/heroContent.ts`.
- `hero.tsx` consume `heroContent`.
- La parte de tipos de servicio del hero permanece derivada del catálogo.

**Criterio de cierre (cumplido)**
- El hero ya no tiene copy editorial crítica enterrada únicamente en JSX.

---

## Fase 5 — Micro-consolidación de labels globales de navegación/CTA

**Estado actual:** 🟨 Parcialmente completa

**Objetivo original**  
Reducir inconsistencias de labels globales repetidos (header/footer y CTAs recurrentes), sin sobrecentralizar.

**Qué se implementó**
- Labels globales de navegación (`Inicio`, `Servicios`) centralizadas en `NAV_LINKS`.
- Header y Footer consumen la misma fuente.

**Remanente real (opcional, no bloqueante)**
- Revisar solo labels CTA globales repetidos no cubiertos por `NAV_LINKS`.
- Mantener inline los mensajes contextuales de WhatsApp cuando aporten valor comercial/analítico.


**Alineación documental complementaria (2026-04-14)**
- Se documenta como ajuste acotado ya implementado: el copy de `SectionIntro` usado en Home y `/services` dejó de estar inline y ahora vive en `src/content/sectionIntroContent.ts`.
- `SectionIntro` se mantiene como componente presentacional puro; no se incorporaron defaults de contenido ni una capa global adicional tipo CMS/diccionario.

---

## Riesgo y alcance remanente

No hay deuda crítica obligatoria derivada de este plan para mantener alineación documental-técnica.

Pendientes posibles (si se decide invertir tiempo):
1. Ajuste fino de wording en CTAs globales repetidos.
2. Revisión periódica para evitar que este plan vuelva a quedar desfasado frente al código.

## Decisión operativa

Este documento queda como **plan con trazabilidad ejecutada** (no como backlog completamente pendiente).
