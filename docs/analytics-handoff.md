# Analytics y medición

> Estado: código preparado para revisión; configuración GA4 actualizada el 21/10/2026.
> Alcance: GA4 directo, sin GTM, solo superficie pública.

## Eventos y significado

| Evento | Disparador | Qué significa |
|---|---|---|
| `whatsapp_intent` | Un clic en `WhatsAppButton` | Intención de contacto; no confirma mensaje ni consulta |
| `phone_click` | Un clic en `PhoneLink` del pie | Intención de llamar; no confirma llamada |
| `scroll_50` / `scroll_90` | Se alcanza el umbral | Profundidad de lectura, una vez por visita a la ruta |

Los eventos de contacto llevan `channel`, `cta_location`, `cta_label`, `destination` y `page_path`. El destino no incluye query ni fragmento. La ruta se limita a `/`, `/services` o `/evaluar` y se elimina cualquier query/fragmento explícito. Los helpers no emiten eventos custom para rutas privadas o desconocidas.

Las etiquetas de servicios y `/evaluar` son genéricas para no comunicar el servicio elegido ni la rama seleccionada. El mensaje precargado sigue viajando a WhatsApp al abrir el enlace, pero no se incluye en el evento custom de GA4.

## Carga y entornos

`GoogleAnalytics` de `@next/third-parties/google` se carga en el layout público cuando existe `NEXT_PUBLIC_GA_ID`, `NODE_ENV=production` y `VERCEL_ENV` está ausente o es `production`. Desarrollo, tests y Vercel previews no cargan la propiedad de producción. Un despliegue fuera de Vercel requiere una configuración explícita del ID.

`/admin` y el layout raíz no montan `GoogleAnalytics`. El tracker de scroll solo se monta cuando GA está habilitado. La ausencia de ID no bloquea el contacto.

## Configuración externa verificada el 21/10/2026

- Propiedad: `532713101`; cuenta `391101522`.
- Flujo web: `14360876717`; medición `G-78VE3ZGW6G`.
- `whatsapp_intent` y `phone_click` marcados como eventos clave de intención; no equivalen a pacientes adquiridos.
- Dimensiones de alcance Evento: `cta_location` (Ubicación del CTA), `cta_label` (Etiqueta del CTA), `channel` (Canal de contacto).
- Ruta de página: usar la dimensión incorporada de GA4; no crear una duplicada.
- Sin reglas de creación ni modificación de eventos en GA4 al auditar.
- Filtro `Internal Traffic`: Excluir, estado Prueba. No activar exclusión hasta comprobar clasificación de tráfico propio.
- Clics de salida automáticos: desactivados para evitar capturar URLs de WhatsApp con mensajes. Los eventos custom de contacto siguen habilitados.

Las dimensiones nuevas pueden tardar 24–48 horas en estar disponibles; no reconstruyen el histórico anterior a su creación. Las capturas de configuración están en `analytics-evidence/`.

## Transición histórica

El commit `c3d165e42975d16093a15251c163898f36f74fc3`, del 27/09/2026, cambió `generate_lead` por `whatsapp_intent` y eliminó query/fragmento del destino de WhatsApp. La versión de producción auditada fue `df874fe930fb781d80d115288d75a4cfdb0dcbc3`, deployment `dpl_7p5WkCVsuGQEBnCP2GAK5vZdPadG`.

No hay un disparador actual de `generate_lead` en el código ni reglas de GA4 que lo recreen. La coexistencia en un informe de 28 días cruza esa transición; no demuestra duplicación por sí sola. Mantener el histórico sin sumarlo como consultas únicas. Serie diaria verificada para el período 23/09–20/10: `generate_lead`, 1 evento el 23/09 y 2 el 24/09; `whatsapp_intent`, 1 el 27/09, 2 el 28/09, 1 el 30/09 y 1 el 08/10. No hay superposición por día en este período; esto respalda la transición de implementación, sin demostrar identidades únicas entre nombres de evento.

El 21/10/2026 se marcaron los contactos como eventos clave y se crearon las dimensiones. Registrar separadamente la fecha del futuro despliegue de estas correcciones. No presentar la serie histórica como si hubiera tenido esta configuración desde el inicio.

## Validación y publicación

Pruebas automatizadas: evento único por handler de clic, destinos sin mensajes, etiquetas genéricas de servicios, rutas privadas bloqueadas, entornos aislados y umbrales de scroll sin repetición dentro de una visita a ruta.

Antes del despliegue: revisar diff y evidencia. Después de aprobar y publicar: comprobar todos los CTA en escritorio y móvil, confirmar en DebugView un evento por clic con `channel`, `cta_location`, `cta_label` y ruta, verificar scroll 50/90 y comprobar que `/admin` no carga el script. Probar rutas públicas sin datos personales. Las pruebas locales no sustituyen la recepción real en GA4.

El flujo mostraba ausencia de datos durante las últimas 48 horas al auditar. Con este volumen no permite concluir por sí solo que la etiqueta esté rota; la recepción debe probarse explícitamente. No se certifica DebugView todavía.

## Seguimiento

Usar `analytics-seguimiento-semanal.md`. Las cuatro semanas comienzan después de validar producción. No automatizar atribución entre métricas web y conteos administrativos. No enviar nombres, números de paciente, DNI, diagnósticos, respuestas de evaluación ni notas clínicas a Analytics.
