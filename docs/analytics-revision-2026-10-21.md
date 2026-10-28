# Revisión de medición — 21 de octubre de 2026

## Resultado

Configuración de GA4 aplicada. Código corregido y validado localmente, pendiente de revisión y despliegue. Las cuatro semanas de observación todavía no empezaron.

## Auditoría

Producción corresponde al repositorio `RadikeCosa/kinesiologiaadomicilio`, rama `main`, commit `df874fe930fb781d80d115288d75a4cfdb0dcbc3`. Se trabajó en una copia aislada dentro de este proyecto, rama `fix/reliable-contact-analytics`; no se alteró el checkout original ni `sources/`.

El evento ya cambió de `generate_lead` a `whatsapp_intent` en el commit `c3d165e` del 27/09/2026. GA4 no tiene reglas de creación/modificación que lo dupliquen. No se encontró otro uso actual de `generate_lead`. Los 3 eventos antiguos y 5 nuevos del período histórico no se sumaron como consultas únicas. Se verificó el desglose diario: `generate_lead` tuvo 1 evento el 23/09 y 2 el 24/09; `whatsapp_intent`, 1 el 27/09, 2 el 28/09, 1 el 30/09 y 1 el 08/10. No hay superposición por día en el período auditado, consistente con el cambio de implementación.

## Configuración aplicada en GA4

- Eventos clave: `whatsapp_intent` y `phone_click`. Teléfono queda configurado aunque aún no tenga datos recibidos.
- Tres dimensiones de evento creadas: `cta_location`, `cta_label`, `channel`.
- Clics de salida automáticos desactivados: podían capturar el enlace de WhatsApp con texto precargado. Se conservan los eventos custom.
- Filtro `Internal Traffic` verificado en modo Prueba; no se activó exclusión. Clasificación del tráfico propio pendiente de comprobar.
- No se eliminaron datos ni se cambiaron los otros eventos clave existentes.

Evidencia: [eventos clave](analytics-evidence/eventos-clave-2026-10-21.png), [dimensiones](analytics-evidence/dimensiones-2026-10-21.png), [clics automáticos desactivados](analytics-evidence/privacidad-2026-10-21.png).

## Correcciones de código preparadas

- Analytics no se carga en desarrollo/tests ni builds de Vercel preview; requiere un ID y un build de producción.
- Los eventos custom aceptan únicamente las tres rutas públicas; se eliminan query y fragmento de rutas explícitas y destinos de teléfono, además de WhatsApp.
- Las etiquetas analíticas de servicios y evaluación son genéricas; el texto visible y los mensajes hacia WhatsApp se conservan.
- Documentación actualizada y plantilla semanal de métricas web y conteo operativo agregado preparada.

## Validación realizada

- 796 pruebas pasan en 122 archivos; incluyen 23 pruebas focalizadas de tracking, privacidad, handlers y scroll.
- Lint y comprobación de tipos sin errores; compilación de producción exitosa usando FHIR dev/test como configuración, sin datos de pacientes.
- Navegación local revisada: inicio, servicios, evaluación, selección de una opción de prueba y formulario vacío de nueva solicitud en administración. Los destinos de WhatsApp/teléfono se conservaron. No se enviaron mensajes ni se iniciaron llamadas.
- En el build local, sin ID configurado, no se cargaron scripts de Google en público ni en administración. El aislamiento de entornos con un ID presente también está cubierto por pruebas unitarias.
- El conteo único por clic y los umbrales se verificaron en pruebas automatizadas; todavía no se verificó su recepción en DebugView para esta nueva versión.
- Se revisaron adquisición y Search Console; la línea de base quedó en la plantilla de seguimiento.

## Antes de publicar y después

1. Revisar el diff de la rama y aprobar el despliegue. No se hizo push ni despliegue, ni siquiera de preview.
2. Publicar el cambio revisado y registrar commit, fecha y hora de corte.
3. Probar CTA de encabezado, inicio, presentación, proceso, cada servicio, CTA final de servicios, evaluación y pie; probar teléfono sin completar llamada ni enviar mensajes.
4. Confirmar en DebugView un único evento por clic y parámetros genéricos; scroll al 50/90 una vez por visita a ruta; comprobar acceso directo a `/admin` sin script. El flujo web advertía que no había datos en las últimas 48 horas: validar recepción, no darla por hecha.
5. A las 24–48 horas, comprobar las tres dimensiones. Mantener el filtro interno en Prueba hasta verificar qué identifica; no activar sin esa evidencia.
6. Completar fecha inicial en la plantilla y comenzar cuatro semanas consecutivas. El profesional debe aportar los conteos reales; no se inventaron cantidades ni se accedió a conversaciones de pacientes.

## Recuperación

Antes de desplegar, se puede descartar el cambio de código sin afectar producción. Tras desplegar, revertir el commit de implementación si aparece una regresión. En GA4 se pueden desmarcar los nuevos eventos clave; las dimensiones creadas y la desactivación de clics de salida no alteran el histórico. No reactivar la captura automática de enlaces de WhatsApp sin resolver primero la exposición del mensaje.
