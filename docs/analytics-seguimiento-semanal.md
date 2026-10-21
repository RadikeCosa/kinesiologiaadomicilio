# Seguimiento semanal de la landing

Estado: preparado; las cuatro semanas comienzan después de validar el despliegue.
Responsables: profesional (conteo de consultas y tratamientos) y revisión de GA4/Search Console.
Zona horaria de trabajo: America/Argentina/Buenos_Aires. Registrar también la zona de la propiedad GA4 antes de comparar períodos.

## Línea de base histórica: 23/09–20/10/2026

31 usuarios totales, 70 vistas, 228 eventos, 48 eventos `session_start` (no sustituir por la métrica Sesiones).
`whatsapp_intent`: 5 eventos / 5 usuarios; `generate_lead`: 3 eventos / 3 usuarios.
No sumar estos usuarios ni presentar los eventos como consultas recibidas.
La transición de código fue el 27/09/2026; el marcado como eventos clave y las dimensiones se configuraron el 21/10/2026 y no reconstruyen retroactivamente las conversiones.

## Navegación e intención de contacto

Usar períodos consecutivos de siete días completos desde el día posterior a la validación; extraer cada semana cuando hayan pasado 48 horas desde su cierre. No completar ausencias de datos con ceros.

| Semana | Desde / hasta | Usuarios totales | Sesiones | Usuarios con whatsapp_intent | Usuarios con phone_click | Origen principal y sesiones | Estado |
|---|---|---:|---:|---:|---:|---|---|
| 1 | Pendiente de validación | — | — | — | — | — | Pendiente |
| 2 | Pendiente de validación | — | — | — | — | — | Pendiente |
| 3 | Pendiente de validación | — | — | — | — | — | Pendiente |
| 4 | Pendiente de validación | — | — | — | — | — | Pendiente |

Para cada semana, añadir un desglose de usuarios con intención por `channel`, `cta_location`, `cta_label` y ruta de página. No sumar usuarios de distintas filas: una persona puede aparecer en varias. Si las dimensiones siguen sin datos tras 48 horas, verificar parámetros y configuración antes de interpretar.

## Resultados operativos: conteo manual agregado

Una consulta nueva corresponde a un caso nuevo recibido por WhatsApp o teléfono; varios mensajes del mismo caso cuentan una vez. Excluir pruebas, spam y seguimiento de casos ya abiertos. Una consulta compatible debe corresponder tanto a la zona atendida como al servicio ofrecido. Un tratamiento iniciado requiere que haya comenzado efectivamente la atención; no alcanza con un turno acordado.

| Semana | Consultas nuevas recibidas | Compatibles con zona y servicio | Tratamientos iniciados | Estado del conteo |
|---|---:|---:|---:|---|
| 1 | — | — | — | Pendiente |
| 2 | — | — | — | Pendiente |
| 3 | — | — | — | Pendiente |
| 4 | — | — | — | Pendiente |

Registrar solo cantidades; no agregar nombres, teléfonos, diagnósticos ni notas de casos. Estos números pueden incluir otros canales de captación y tratamientos originados en semanas anteriores: no dividirlos por clics como si fueran una conversión atribuida a la web.

## Visibilidad en Google

Por semana: impresiones, clics, CTR y posición media; anotar qué búsquedas y páginas concentran la demanda. Search Console y GA4 miden fenómenos distintos y pueden usar diferentes zonas horarias: no esperar coincidencia exacta entre clics y sesiones.

## Revisión final

Al finalizar cuatro semanas, distinguir si hay evidencia de un problema de visibilidad, de intención de contacto o de compatibilidad de las consultas. Proponer un cambio puntual con la evidencia disponible. Si los datos son insuficientes, extender observación; no fijar una meta de conversión ni iniciar pruebas A/B con esta muestra.

## Adquisición y Search Console: línea de base auditada

Período: 23/09–20/10/2026, informes consultados el 21/10/2026.

- GA4 Adquisición de tráfico: **48 sesiones**, 24 Organic Search (50 %), 17 Direct (35,42 %) y 7 Referral (14,58 %). 34 sesiones con interacción (70,83 %).
- Search Console, informe por página de destino: **1.022 impresiones, 20 clics, CTR 1,96 %, posición media 10,19**. Inicio: 19 clics y 993 impresiones; `/evaluar`: 1 clic y 29 impresiones.
- Informe por consulta: 647 impresiones y 3 clics visibles. `kinesiologia neuquen`: 411 impresiones, 1 clic y posición 10,70. Estos totales por consulta difieren de los del informe por página; no usarlos como total de tráfico ni sumar ambos informes.
- No atribuir las 24 sesiones orgánicas a los 20 clics como una correspondencia individual. No concluir todavía que sea necesario un rediseño por el CTR observado.
