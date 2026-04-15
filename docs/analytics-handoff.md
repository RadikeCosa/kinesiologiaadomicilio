# Analytics y medición — estado actual (handoff técnico)

## Resumen ejecutivo
Este proyecto ya tiene medición base implementada con **Google Analytics 4 (GA4) integrado directamente en Next.js**, sin Google Tag Manager (GTM). El tracking actual cubre: eventos automáticos de visita (provistos por GA4), eventos custom de intención de contacto (`generate_lead`, `phone_click`) y profundidad de scroll (`scroll_50`, `scroll_90`). También existe token de verificación de Google Search Console en metadata global.  
Este documento consolida el estado real implementado en código y deja explícitos límites, validación disponible y próximos pasos.

## Objetivo de negocio del sistema de medición
La estrategia de medición está planteada para cubrir el funnel:

1. **Visita**
   - Señales esperadas: `page_view`, `session_start`, `first_visit` (eventos automáticos de GA4).
2. **Interés / lectura**
   - Señales implementadas: `scroll_50`, `scroll_90`.
3. **Intención de contacto**
   - Señales implementadas: `generate_lead` (WhatsApp) y `phone_click` (teléfono).
4. **Adquisición orgánica**
   - Fuente prevista: Google Search Console (GSC), con verificación declarada en metadata.

## Arquitectura y estado técnico actual

### 1) Integración GA4
- Se usa `GoogleAnalytics` de `@next/third-parties/google` en el layout raíz.  
- El ID de medición se toma de la variable de entorno `NEXT_PUBLIC_GA_ID`; si no existe, GA4 no se inyecta.  
- El wiring principal está en `src/app/layout.tsx`.

### 2) Sin GTM
- No hay contenedor GTM ni referencia a scripts de Tag Manager en el código.

### 3) Capa compartida de analytics
- Existe una capa central en `src/lib/analytics.ts` con funciones tipadas para:
  - `trackGenerateLead`
  - `trackPhoneClick`
  - `trackScroll50`
  - `trackScroll90`
- Todos estos envíos usan `sendGAEvent`.

### 4) Tracker global de scroll
- El componente `ScrollDepthTracker` está montado en el layout global y escucha scroll por ruta.
- Al llegar por primera vez en la vista actual al 50% y 90%, dispara los eventos correspondientes (una vez por umbral y por ruta).

### 5) Search Console
- En la metadata global hay `verification.google` configurado con un token de verificación.
- Esto cubre la parte de declaración en sitio; la operación completa de GSC (propiedad, sitemap, lectura de datos) depende de la configuración en la consola.

## Inventario exacto de eventos implementados

## A. `generate_lead`
- **Propósito:** medir intención de contacto vía WhatsApp.
- **Cuándo dispara:** en `onClick` de botones/enlaces de WhatsApp implementados con `WhatsAppButton`.
- **Dónde dispara:** desde `src/components/WhatsAppButton.tsx`, reutilizado en header, hero, tarjetas de servicios, CTA final de servicios y footer.
- **Parámetros enviados:**
  - `channel: "whatsapp"`
  - `cta_location`
  - `cta_label` (si está disponible)
  - `destination` (URL `wa.me` con mensaje)
  - `page_path` (resuelto por helper)
- **Por qué ese nombre:** se alinea con convención de intención comercial (lead) y diferencia claramente el contacto WhatsApp del click telefónico.

## B. `phone_click`
- **Propósito:** medir intención de contacto vía llamada telefónica.
- **Cuándo dispara:** en `onClick` del componente `PhoneLink`.
- **Dónde dispara:** actualmente en el teléfono del footer.
- **Parámetros enviados:**
  - `channel: "phone"`
  - `cta_location`
  - `cta_label` (si está disponible)
  - `destination` (URL `tel:`)
  - `page_path` (resuelto por helper)

## C. `scroll_50`
- **Propósito:** proxy de interés/lectura en la página.
- **Regla de disparo:** cuando el progreso de scroll es `>= 50%` del documento visible; se envía una sola vez por ruta (hasta cambiar de pathname).
- **Parámetros enviados:**
  - `scroll_threshold: 50`
  - `page_path`
  - `page_title`

## D. `scroll_90`
- **Propósito:** proxy de lectura profunda/interés alto.
- **Regla de disparo:** cuando el progreso de scroll es `>= 90%`; una sola vez por ruta.
- **Parámetros enviados:**
  - `scroll_threshold: 90`
  - `page_path`
  - `page_title`

### Nota sobre eventos automáticos de GA4
Además de los custom anteriores, GA4 puede registrar eventos automáticos (por ejemplo `page_view`, `session_start`, `first_visit`, y eventualmente `click` según configuración/medición mejorada). Esos eventos **no reemplazan** los eventos custom implementados para intención de contacto y lectura.

## Superficies instrumentadas

### WhatsApp (`generate_lead`)
- Header (CTA “Contactar”): `cta_location = "header"`.
- Hero (CTA principal): `cta_location = "hero"`.
- Home — sección “Cómo funciona” (CTA final): `cta_location = "how_it_works"`.
- Servicios:
  - CTA en cada card de servicio: `cta_location = "services"`.
  - CTA final de página de servicios: `cta_location = "services"`.
- Footer (botón WhatsApp): `cta_location = "footer"`.

### Teléfono (`phone_click`)
- Link telefónico en footer: `cta_location = "footer"`.

### Scroll
- Tracker global activo desde layout (impacta todas las rutas renderizadas bajo ese layout).

### Valores actualmente usados de `cta_location`
En el código existen los tipos posibles: `"hero" | "services" | "footer" | "header" | "contact" | "how_it_works" | "other"`.  
En la instrumentación actualmente observada se usan: `"header"`, `"hero"`, `"how_it_works"`, `"services"`, `"footer"`.

## Validación realizada / evidencia disponible

### Lo que sí puede confirmarse por código
- Integración GA4 condicional por `NEXT_PUBLIC_GA_ID` correctamente cableada.
- Disparo de `generate_lead` en CTAs de WhatsApp.
- Disparo de `phone_click` en link telefónico instrumentado.
- Disparo de `scroll_50` y `scroll_90` desde tracker global de scroll.
- Verificación Google en metadata para Search Console.

### Lo que no está registrado en el repositorio
No hay evidencia versionada (tests automáticos, reportes QA guardados o capturas) que pruebe en este repo:
- “GA4 reconocido” en tiempo real,
- eventos efectivamente visibles en Realtime,
- ni validación operativa final de Search Console.

Por lo tanto, esas validaciones deben considerarse **pendientes de confirmación operativa** fuera del código (entorno real con propiedad GA4/GSC activa).

## Límites y comportamiento esperado
- No se usa GTM (todo va directo vía Next + `sendGAEvent`).
- No hay dashboard interno custom en el repo.
- GA4 puede demorar en mostrar completamente eventos nuevos en reportes estándar.
- Parámetros custom (`cta_location`, `channel`, `destination`, `page_path`, etc.) requieren configuración de custom dimensions en GA4 para explotarlos plenamente en reportes.
- Search Console requiere tiempo para poblar datos de adquisición orgánica incluso después de verificar propiedad.
- `scroll_50` / `scroll_90` son proxies de lectura/interés, no garantizan lectura real del contenido.

## Próximos pasos recomendados (sin ejecutar en este repo)
1. En GA4, revisar/crear custom dimensions para al menos: `cta_location`, `channel`, `destination`, `page_path`.
2. Completar verificación operativa de Google Search Console (si faltara) y enviar sitemap.
3. Definir lectura conjunta GSC + GA4 para analizar adquisición orgánica vs. intención de contacto/conversión.
4. Documentar evidencia de QA manual (Realtime, DebugView y capturas) en una actualización futura de este documento.
