# Analytics y medición

> Estado: vigente
> Última actualización: 2026-09-27 (UTC)
> Alcance: tracking público con GA4 directo, sin GTM.

## Resumen
El proyecto usa **Google Analytics 4 (GA4) directo** vía Next.js, sin Google Tag Manager.

Implementa:

- eventos automáticos de GA4 (por integración estándar),
- eventos custom de intención de contacto,
- eventos de profundidad de scroll.

## Integración técnica

- Componente: `GoogleAnalytics` de `@next/third-parties/google`.
- Ubicación de carga GA: `src/app/(public)/layout.tsx` (solo superficie pública).
- Condición de carga: existe `NEXT_PUBLIC_GA_ID`.
- API de envío: `sendGAEvent`.

## Eventos custom implementados

### 1) `whatsapp_intent`
Se dispara desde `WhatsAppButton` al hacer clic en una CTA de WhatsApp. Mide intención de contacto, no una conversación o consulta concretada. No marcar como evento clave sin una decisión explícita sobre su uso en reportes de negocio.

Parámetros enviados:
- `channel: "whatsapp"`
- `cta_location`
- `cta_label`
- `destination` (se elimina query y fragmento; nunca incluir mensajes precargados)
- `page_path`

El `destination` de WhatsApp se limita a la URL base de `wa.me`; el texto precargado puede contener información de salud y no debe enviarse a GA4.

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
- ScrollDepthTracker en `src/app/(public)/layout.tsx` (aplica a superficie pública).
- `/admin` no carga `GoogleAnalytics` y queda fuera del tracking público por layout.

Nota documental: `/evaluar` está instrumentada como superficie activa; hoy figura en el sitemap público (`/`, `/services`, `/evaluar`) aunque no esté en la navegación global principal.

## Límites

- No hay GTM en el repo.
- No hay evidencia versionada de QA de Realtime/DebugView dentro del repositorio.
- Para análisis de parámetros custom, GA4 requiere configurar dimensiones personalizadas.
- `/admin` queda fuera del tracking público por diseño.
