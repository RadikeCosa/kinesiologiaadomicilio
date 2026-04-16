# Analytics y medición — estado actual (handoff técnico)

## Resumen
El proyecto usa **Google Analytics 4 (GA4) directo** vía Next.js, sin Google Tag Manager.

Implementa:
- eventos automáticos de GA4 (por integración estándar),
- eventos custom de intención de contacto,
- eventos de profundidad de scroll.

## Integración técnica

- Componente: `GoogleAnalytics` de `@next/third-parties/google`.
- Ubicación: `src/app/layout.tsx`.
- Condición de carga: existe `NEXT_PUBLIC_GA_ID`.
- API de envío: `sendGAEvent`.

## Eventos custom implementados

### 1) `generate_lead`
Se dispara desde `WhatsAppButton` en clicks de CTA de WhatsApp.

Parámetros enviados:
- `channel: "whatsapp"`
- `cta_location`
- `cta_label`
- `destination`
- `page_path`

### 2) `phone_click`
Se dispara desde `PhoneLink` (actualmente en footer).

Parámetros enviados:
- `channel: "phone"`
- `cta_location`
- `cta_label`
- `destination`
- `page_path`

### 3) `scroll_50`
Se dispara una vez por ruta cuando el scroll supera 50%.

Parámetros:
- `scroll_threshold: 50`
- `page_path`
- `page_title`

### 4) `scroll_90`
Se dispara una vez por ruta cuando el scroll supera 90%.

Parámetros:
- `scroll_threshold: 90`
- `page_path`
- `page_title`

## Valores de `cta_location`

Tipo soportado actualmente en código:
- `"hero" | "services" | "footer" | "header" | "contact" | "how_it_works" | "evaluar" | "other"`

Valores usados en superficies actuales:
- `header`
- `hero`
- `how_it_works`
- `services`
- `footer`
- `evaluar`

## Superficies instrumentadas

- Header: botón WhatsApp.
- Hero: CTA principal WhatsApp.
- Home / “Cómo funciona”: CTA WhatsApp.
- Services: CTA por card + CTA final de página.
- Evaluar: CTA WhatsApp según rama seleccionada.
- Footer: WhatsApp + teléfono.
- ScrollDepthTracker global en layout.

Nota documental: `/evaluar` está instrumentada como superficie activa aunque hoy no figure en navegación global ni en el sitemap.

## Límites

- No hay GTM en el repo.
- No hay evidencia versionada de QA de Realtime/DebugView dentro del repositorio.
- Para análisis de parámetros custom, GA4 requiere configurar dimensiones personalizadas.
