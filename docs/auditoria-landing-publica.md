# Auditoría de landing pública y plan de implementación

Fecha de corte: 27 de septiembre de 2026. Alcance: `/`, `/services` y `/evaluar`. El área privada `/admin` queda fuera de alcance.

## Resumen

La base técnica es sólida: las tres rutas tienen metadatos propios, canonical, sitemap, robots y datos estructurados; Lighthouse informa SEO 100/100 en las páginas medidas. La oportunidad principal está en accesibilidad visual y en la experiencia de inicio de la página de inicio. En PageSpeed Insights no hay datos de campo (CrUX) para estas URLs; los valores siguientes son pruebas de laboratorio y no representan una muestra de usuarios reales.

Se corrigió durante esta auditoría un riesgo de privacidad: el evento GA4 de clic a WhatsApp podía registrar la URL completa, que incluye el texto precargado. Ahora se eliminan query y fragmento antes de enviar el destino a analítica. La interacción debe interpretarse como intención de contacto, no como consulta completada.

## Línea base de laboratorio

Lighthouse 13.5.0, PageSpeed Insights, 27/09/2026:

| Ruta y dispositivo | Rendimiento | FCP | LCP | TBT | CLS | Accesibilidad | SEO |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Inicio, móvil | 83 | 2,8 s | 3,9 s | 100 ms | 0 | 96 | 100 |
| Servicios, móvil | 84 | 2,7 s | 3,8 s | 80 ms | 0 | 96 | 100 |
| Evaluar, móvil | 100 | 0,9 s | 1,2 s | 40 ms | 0 | 96 | 100 |
| Inicio, escritorio | 100 | 0,2 s | 0,4 s | 40 ms | 0 | 96 | 100 |
| Evaluar, escritorio | 97 | 0,2 s | 0,4 s | 150 ms | 0 | 96 | 100 |

El desglose de LCP del inicio móvil registró 190 ms de demora de carga del recurso, 250 ms de descarga y 880 ms de demora de renderizado del elemento. El elemento LCP fue la imagen principal. El reporte estimó unos 150 ms de ahorro potencial por recursos que bloquean renderizado y alrededor de 91 KB de JavaScript no usado en inicio; servicios, aproximadamente 130 ms y 94 KB. Son estimaciones de Lighthouse: medir de nuevo antes de atribuir mejoras a una intervención.

## Datos de Search Console y GA4

Search Console, últimos 3 meses (25/06–24/09/2026): 54 clics, 3.773 impresiones, CTR medio 1,4 % y posición media 11,4. La tabla por página atribuye los clics a inicio (54) y evaluar (1; las cifras por fila pueden no sumar el total por umbrales/privacidad de Google). Servicios no aparece en las filas con impresiones. Hay 2 páginas indexadas y 1 descubierta sin indexar; el detalle identifica `/services`, detectada el 01/07/2026 y todavía sin primer rastreo al 20/09/2026. Esto es prioridad SEO: comprobar accesibilidad/canonical/sitemap y solicitar indexación manual después de verificar la ruta. No se envió una solicitud de indexación en esta auditoría. Search Console indica Core Web Vitals sin datos de campo en móvil y escritorio.

GA4, últimos 28 días (30/08–26/09/2026): 30 usuarios activos, 45 vistas de inicio, 4 de servicios y 2 de evaluar; 25 sesiones de búsqueda orgánica, 12 directas y 1 referral. El evento `generate_lead` registró 13 eventos de 11 usuarios. Se renombró en la implementación a `whatsapp_intent` para dejar claro que mide clic/intención hacia WhatsApp, no conversación completada; los conteos futuros comienzan con el nuevo nombre y no se alteran las cifras históricas. Se mantiene como evento estándar, no como evento clave. La cantidad de datos es pequeña y el periodo corto; tomarlo como línea base descriptiva, no como estimación estable de demanda.

## Hallazgos y prioridades

### P0 — Privacidad de medición — resuelto

El destino enviado con el evento de WhatsApp podía incluir query string con texto precargado y contexto potencialmente sensible. `sanitizeDestination` elimina query y fragmento. Se añadió una prueba de regresión que usa contenido de salud en la query y verifica que el evento conserva solo el origen y teléfono. No se recopila el texto clínico del mensaje.

### P1 — Contraste y accesibilidad visual — requiere corrección

La auditoría de Lighthouse marcó contraste insuficiente (puntuación 96): enlaces y botones celestes, texto de acento y botones verdes de WhatsApp en header, hero, secciones informativas y footer. Objetivo de implementación: WCAG 2.2 nivel AA para contraste, foco visible y navegación por teclado. Incluir revisión de contraste normal y grande, estados hover/focus, zoom/reflow móvil y texto alternativo contextual. Lighthouse no reemplaza una revisión completa manual con teclado y lector de pantalla.

### P1 — Experiencia móvil del inicio y servicios

Inicio y servicios tienen LCP de laboratorio cercano a 4 s en móvil, mientras que `/evaluar` carga rápido. El hero es el LCP en inicio, pero el desglose muestra que la demora de renderizado supera la de descarga. Optimizar primero el orden/renderizado y validar la estrategia de imágenes y CSS; no asumir que el tamaño del PNG original explica por sí solo el LCP, ya que Next.js entrega variantes optimizadas.

Servicios reportó además enlaces repetidos con el mismo propósito en el chequeo de buenas prácticas. Revisar etiquetas de los botones de cada tarjeta y darles contexto accesible (por ejemplo, nombrar la situación), conservando la acción y evitando prometer resultados.

### P2 — Jerarquía y orientación

El inicio presenta propuesta, ubicación, CTA, perfil, proceso y luego una vista breve que solo dirige a todos los servicios. Evaluar ya ofrece una orientación concisa y obtiene buenos resultados móviles. En el prototipo se exploran dos jerarquías para hacer más clara la decisión inicial y acercar las situaciones atendidas sin alterar hechos clínicos ni inventar testimonios.

### P1 — Indexación de `/services`

Search Console la marca «Descubierta: actualmente sin indexar», sin fecha de último rastreo, desde el 01/07/2026. La página no aparece en los resultados agregados por URL durante el periodo. Verificar respuesta pública, canonical y sitemap; después solicitar indexación en Search Console y monitorear cobertura.

### P2 — SEO local

La web ya incorpora metadatos, canonical, sitemap, robots y JSON-LD de `MedicalBusiness`. Se retiraron del marcado los datos no verificados de rango de precios y perfiles sociales. Antes de ampliarlo, confirmar que cada dato estructurado refleje información vigente del negocio. Search Console y GA4 ya se consultaron para establecer la línea base de esta auditoría. La ficha de Google Business Profile no pudo confirmarse públicamente: su estado y titularidad son bloqueantes solo para auditar/optimizar esa ficha, no para el SEO local dentro del sitio.

## Decisiones que requieren aprobación del titular

El titular eligió la dirección **B · Cercana y editorial**. El prototipo [direcciones UX](prototipos/direcciones-ux.html) conserva ambas alternativas como registro de la decisión:

- **A · Clara y directa:** ubicación, propuesta y consulta primero; luego señales de confianza y pasos.
- **B · Cercana y editorial (seleccionada):** enfatiza contexto cotidiano y presentación del profesional antes del recorrido.

Los textos del prototipo eran provisionales; la implementación conserva los hechos publicados y el comportamiento actual de evaluación y contacto.

## Secuencia y esfuerzo estimado

Estimación inicial para una persona implementando y revisando con el titular; depende de la rapidez de aprobación y acceso a medición. Los rangos se ajustan después de la decisión visual.

| Fase | Trabajo | Esfuerzo estimado | Salida / criterio |
| --- | --- | ---: | --- |
| 1. Cierre de auditoría | Línea base de Search Console/GA4 ya consultada; revisar datos estructurados, contenido, navegación y accesibilidad manual | 0,5–1 día | Línea base documentada; separar intención de clic de consulta concretada; verificar `/services` |
| 2. Dirección UX/UI | Elegir prototipo, afinar copy/jerarquía y validar móvil/escritorio | 0,5–1 día | Aprobación del titular sobre alternativa y alcance |
| 3. Implementación visual | Componentes y responsive para inicio, servicios y evaluar; mantener lógica existente | 2–4 días | Revisión funcional y visual de rutas públicas |
| 4. Rendimiento, a11y y SEO | Contraste WCAG AA, teclado/foco, imágenes, carga, metadatos, sitemap y datos estructurados | 1–2 días | Revisión sin regresiones y reportes de laboratorio comparables |
| 5. Publicación y observación | Deploy, verificación de rutas/CTA/redirects, monitoreo y reversión si hace falta | 0,5–1 día | Checklist post-deploy; rollback a versión anterior si falla una ruta/SEO |

Total preliminar: **4,5–9 días hábiles**, más espera de aprobaciones y acceso a Google. No incluye gestión de ficha de Google Business Profile ni generación de contenido clínico nuevo.

## Verificación y rollback de publicación

Antes del deploy: guardar URLs/canonicals actuales, probar rutas y enlaces internos, comprobar destino y evento de WhatsApp sin enviar contenido del mensaje a GA4, revisar sitemap/robots/datos estructurados y tomar una nueva corrida de Lighthouse móvil/escritorio. Si se modifica o elimina una URL, preparar redirección permanente y comprobar destino/canonical para evitar cadenas o destinos rotos.

Después del deploy: comprobar HTTP 200 de cada ruta, canonical, sitemap y robots; abrir CTA y flujo de evaluación en móvil; comprobar el evento de intención agregado; revisar Search Console para errores nuevos cuando haya acceso. Si una ruta, conversión o señal SEO esencial falla, volver a la versión anterior del deploy y repetir la validación antes de reintentar.

## Implementación aprobada (dirección B)

Se aplicó una jerarquía editorial mobile-first a inicio, servicios y orientación; el perfil profesional queda junto al mensaje principal, las áreas atendidas aparecen en la portada y los botones de servicio identifican el tema de la consulta. Se aumentaron los blancos, tamaños de objetivo táctil y legibilidad de texto; el evento GA4 pasó a `whatsapp_intent`. Tras publicar, quedan pendientes la revisión de la ficha y la solicitud manual de indexación de `/services`.

## Cambios preparados en esta auditoría

- Sanitización de destinos de WhatsApp en GA4 con prueba de regresión.
- `lastModified` por ruta en sitemap en lugar de una fecha común obsoleta.
- Prototipo local de dos alternativas; la dirección B se implementó.
- Las mediciones de laboratorio deben repetirse tras publicar para compararlas con la línea base. Antes del commit se ejecutaron tests, TypeScript, ESLint y build de producción; sus resultados se registran en el cierre de implementación.
