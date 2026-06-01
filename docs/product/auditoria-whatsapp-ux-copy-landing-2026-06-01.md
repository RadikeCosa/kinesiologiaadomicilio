# Auditoría UX/copy/producto y técnica del flujo de WhatsApp de la landing pública

Fecha: 2026-06-01  
Alcance: landing pública de kinesiología y rehabilitación a domicilio en Neuquén.  
Excluido: `/admin`, formularios nuevos, self-booking y automatizaciones externas.

## 1. Resumen ejecutivo

El flujo público de WhatsApp está técnicamente centralizado en un componente (`WhatsAppButton`) y un helper de URL (`getWhatsAppUrl`), pero el copy no está completamente centralizado: existe un mensaje global compartido para Header/Footer y varias copias literales muy similares en Hero, Home, Services y `/evaluar`.

El patrón actual pre-carga un mensaje de 5 a 7 líneas con tres campos a completar (`Zona/barrio`, `Motivo de consulta`, `Edad aproximada`) y una frase final que pide disponibilidad, modalidad particular y valor. Esto parece útil operativamente, pero genera una primera interacción con forma de mini-formulario dentro de WhatsApp. La observación práctica de que usuarios borran o no completan el mensaje es consistente con una fricción conversacional alta en CTAs generales.

Recomendación: hacer un Patch 1 mínimo que simplifique el mensaje inicial de CTAs generales a una frase liviana, mantener el tracking actual y mover la pre-calificación a la primera respuesta humana. Como Patch 2 opcional, separar mensajes contextuales por intención: generales, servicios y resultado de `/evaluar`, sin agregar arquitectura pesada.

## 2. Estado actual detectado en código

Hallazgos confirmados en código:

- `WhatsAppButton` recibe `message`, construye `href` con `getWhatsAppUrl(message)` y dispara `trackGenerateLead` en click. Ver `src/components/WhatsAppButton.tsx`.
- `getWhatsAppUrl` codifica el mensaje con `encodeURIComponent` y arma `https://wa.me/${BUSINESS_CONFIG.phoneClean}?text=${encodedMessage}`. Ver `src/lib/config.ts`.
- Existe un mensaje global `WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE` en `src/lib/whatsapp-messages.ts`.
- Ese mensaje global se usa en Header y Footer, pero no en todas las superficies públicas.
- Hero, About, How it works, Services, service cards y `/evaluar` tienen mensajes propios en archivos de contenido.
- El tracking público vive en `src/lib/analytics.ts` y envía GA4 directo con evento `generate_lead`.
- La shell pública carga GA4 solamente si existe `NEXT_PUBLIC_GA_ID`; `/admin` queda fuera por layout separado. Ver `src/app/(public)/layout.tsx`.

## 3. Inventario de CTAs de WhatsApp

| Superficie | Archivo | CTA visible | Mensaje usado | Tracking |
| --- | --- | --- | --- | --- |
| Header | `src/components/Header.tsx` | `Contactar` desktop / `WhatsApp` mobile | `WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE` | `cta_location: header`, `cta_label: Contactar` |
| Hero Home | `src/app/hero/hero.tsx` + `src/app/hero/heroContent.ts` | `Consultar por mi familiar` | Mensaje contextual para familiar | `cta_location: hero`; sin `ctaLabel` explícito, se resuelve por children string |
| About Home | `src/app/home/components/AboutSection.tsx` + `src/app/home/homeContent.ts` | `Consultar con Ramiro` | Mensaje general duplicado | `cta_location: other`; sin `ctaLabel` explícito |
| How it works Home | `src/app/home/components/HowItWorksSection.tsx` + `src/app/home/howItWorksContent.ts` | `Iniciar consulta por WhatsApp` | Mensaje general duplicado | `cta_location: how_it_works`; sin `ctaLabel` explícito |
| Services cards | `src/app/(public)/services/components/ServiceCard.tsx` + `src/lib/servicesData.ts` | `Consultar` | Mensaje contextual por servicio | `cta_location: services`; `cta_label: Consultar` |
| Services CTA final | `src/app/(public)/services/page.tsx` + `src/app/(public)/services/servicesPageContent.ts` | `Consultá por WhatsApp` | Mensaje general duplicado | `cta_location: services`; sin `ctaLabel` explícito |
| Footer | `src/components/Footer.tsx` | `WhatsApp` | `WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE` | `cta_location: footer`; `cta_label` inferido como `WhatsApp` |
| `/evaluar` resultado | `src/app/(public)/evaluar/components/EvaluarFlow.tsx` + `src/app/(public)/evaluar/evaluar-content.ts` | `Consultar por una primera evaluación en domicilio` o `Consultar por este caso en domicilio` | Mensaje de orientación completada, igual en todas las ramas | `cta_location: evaluar`, `cta_label` explícito igual al CTA |

No se detectaron otros CTAs públicos de WhatsApp fuera de este listado con `rg` sobre `src` excluyendo `/admin`.

## 4. Mensajes actuales por superficie

### Mensaje global

Usado en Header y Footer:

```text
Hola, quisiera consultar por kinesiología a domicilio.

Zona/barrio:
Motivo de consulta:
Edad aproximada del paciente:

Quisiera conocer disponibilidad, modalidad de atención particular y valor.
```

### Home general

About y How it works usan una variante casi igual, pero sin línea en blanco antes de la frase final:

```text
Hola, quisiera consultar por kinesiología a domicilio.

Zona/barrio:
Motivo de consulta:
Edad aproximada del paciente:
Quisiera conocer disponibilidad, modalidad de atención particular y valor.
```

### Hero

Hero contextualiza que consulta por un familiar:

```text
Hola, quisiera consultar por kinesiología a domicilio para un familiar.

Zona/barrio:
Motivo de consulta:
Edad aproximada del paciente:
Quisiera conocer disponibilidad, modalidad de atención particular y valor.
```

### Servicios

Cada card de servicio cambia solamente la primera línea:

- Rehabilitación post-operatoria: consulta por rehabilitación post-operatoria a domicilio para un familiar.
- Adultos mayores: consulta por kinesiología para adultos mayores a domicilio.
- Cuidados paliativos: consulta por kinesiología en cuidados paliativos a domicilio.
- Recuperación funcional: consulta por kinesiología a domicilio.

Todos mantienen los campos de pre-calificación y la frase de disponibilidad, modalidad particular y valor.

### `/evaluar`

Todas las ramas del resultado usan el mismo mensaje:

```text
Hola, completé la orientación del sitio y quisiera consultar por kinesiología a domicilio.

Zona/barrio:
Motivo de consulta:
Edad aproximada del paciente:
Quisiera conocer disponibilidad, modalidad de atención particular y valor.
```

El flujo no inyecta el `id` de la rama ni la situación elegida dentro del mensaje.

## 5. Tracking/analytics actual

`generate_lead` envía actualmente:

- `channel: "whatsapp"`
- `cta_location`
- `cta_label`
- `destination`
- `page_path`

Diagnóstico técnico:

- Sí permite distinguir superficie general por `cta_location`: `hero`, `services`, `footer`, `header`, `how_it_works`, `evaluar`, `other`.
- Sí permite inferir página por `page_path`.
- No permite distinguir con campo propio el servicio específico clickeado, porque las cards de servicios comparten `cta_location: services` y `cta_label: Consultar`.
- No permite distinguir la rama exacta de `/evaluar`, porque dos pares de ramas comparten `ctaLabel` y el mensaje es idéntico entre ramas.
- `destination` incluye la URL de WhatsApp con el texto codificado, por lo que hoy podría inferirse contexto en GA4 a partir del destino, pero es frágil y no conviene depender de parsear una URL con mensaje.

Recomendación analítica: preservar GA4 actual en Patch 1. Documentar como Patch 2 opcional la posibilidad de agregar un parámetro no disruptivo (`cta_context` o `intent`) si se quiere medir servicio/rama con precisión. No cambiar GA4 en el primer ajuste de copy.

## 6. Diagnóstico UX/copy

Hallazgos confirmados en código:

- El primer contacto se abre con un texto que pide tres datos concretos y además pide disponibilidad, modalidad particular y valor.
- Varios botones tienen copy visible conversacional y liviano, pero abren un mensaje con estructura de formulario.
- El contenido visible de How it works dice "Contanos brevemente qué necesitás, en qué zona estás y si hay alguna indicación médica previa", mientras el mensaje pide zona, motivo, edad y valor/modalidad.
- El sitio ya comunica en contenido visible que la atención es particular, sin obra social, en `HOME_CONTENT.serviceContext.items`.
- Services FAQ también explica que la modalidad actual es particular y que por WhatsApp se orienta sobre disponibilidad, forma de trabajo y valor.

Hipótesis UX:

- El mensaje actual puede sentirse como trabajo previo antes de iniciar una conversación, especialmente desde Header/Footer o un CTA general.
- Usuarios adultos o familiares que consultan por una situación de salud pueden preferir abrir con una frase simple y esperar guía humana.
- Pedir "valor" y "modalidad particular" en el primer mensaje puede atraer la conversación hacia precio antes de entender encaje, urgencia y zona.
- El usuario que completó `/evaluar` ya atravesó una pequeña interacción y probablemente tolera un mensaje algo más contextual que quien toca Header/Footer, pero no necesariamente tolera completar campos en WhatsApp.

## 7. Riesgos del mensaje actual

- Fricción de inicio: al ver un mensaje con campos vacíos, el usuario puede borrar todo o abandonar.
- Carga cognitiva: pide clasificar motivo, edad y zona antes de recibir contención o guía.
- Desalineación CTA/mensaje: botones como `Contactar`, `Consultar por mi familiar` o `Consultá por WhatsApp` prometen conversación, pero abren una plantilla operativa.
- Señal de precio demasiado temprana: mencionar "valor" puede filtrar casos no compatibles, pero también puede hacer que la conversación empiece como una consulta tarifaria.
- Duplicación de copy: cambiar el mensaje global no impactaría Hero, About, How it works, Services ni `/evaluar`, porque muchas superficies tienen textos propios.
- Tracking contextual limitado: servicios y ramas de `/evaluar` no quedan representados con un campo analítico específico.

## 8. Recomendación de estrategia

Recomiendo simplificar el primer mensaje y separar la pre-calificación de la apertura conversacional.

Estrategia:

1. CTAs generales: mensaje mínimo para maximizar inicio de conversación.
2. CTAs de servicio: mensaje mínimo con intención contextual, sin campos.
3. `/evaluar`: mensaje mínimo que preserve que la persona completó la orientación del sitio.
4. Pre-calificación: pasarla a la primera respuesta de Ramiro, con una pregunta clara y humana.
5. Tracking: conservar `generate_lead` actual en Patch 1.
6. Arquitectura: no agregar formularios ni automatizaciones; priorizar constantes/helper de copy.

## 9. Propuesta de mensajes nuevos

### Mensaje general recomendado

```text
Hola Ramiro, quería consultar por kinesiología a domicilio.
```

### Hero/familiar

```text
Hola Ramiro, quería consultar por kinesiología a domicilio para un familiar.
```

### Servicios

```text
Hola Ramiro, quería consultar por rehabilitación post-operatoria a domicilio.
```

```text
Hola Ramiro, quería consultar por kinesiología para adultos mayores a domicilio.
```

```text
Hola Ramiro, quería consultar por kinesiología en cuidados paliativos a domicilio.
```

```text
Hola Ramiro, quería consultar por recuperación funcional a domicilio.
```

### `/evaluar`

```text
Hola Ramiro, completé la orientación del sitio y quería consultar por una primera evaluación a domicilio.
```

### Primera respuesta humana sugerida

```text
Gracias por escribir. Para orientarte mejor, decime barrio/zona, edad de la persona, motivo principal de consulta y si buscan atención particular a domicilio.
```

Nota: esta respuesta conserva pre-calificación, pero ocurre después de que el usuario ya inició la conversación. También permite introducir modalidad particular de forma humana y contextual.

## 10. Patch 1 recomendado: simplificación de mensaje inicial

Objetivo: reducir fricción sin cambiar arquitectura ni analytics.

Cambios mínimos:

- Reemplazar `WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE` por el mensaje general corto.
- Actualizar o reutilizar ese mensaje en About, How it works y Services CTA final para eliminar duplicación.
- Mantener Hero con variante corta para familiar.
- Mantener Services cards con variante corta por servicio.
- Mantener `/evaluar` con variante corta que mencione que completó la orientación.
- Actualizar `src/lib/whatsapp-messages.test.ts` para validar que el mensaje global es liviano y no contiene campos vacíos.

No cambiar en Patch 1:

- No modificar `trackGenerateLead`.
- No agregar parámetros GA4.
- No tocar `/admin`.
- No agregar formularios.
- No cambiar layout público.

Riesgo del Patch 1:

- Puede bajar la cantidad de datos recibidos en el primer mensaje. Mitigación: usar la primera respuesta humana sugerida y medir si aumenta el volumen de conversaciones iniciadas.

## 11. Patch 2 opcional: mensajes contextuales por intención

Objetivo: mejorar intención y medición sin volver a una plantilla pesada.

Opciones:

- Crear constantes explícitas en `src/lib/whatsapp-messages.ts`, por ejemplo `WHATSAPP_GENERAL_MESSAGE`, `WHATSAPP_FAMILY_MESSAGE`, `buildServiceWhatsAppMessage(serviceIntent)`, `WHATSAPP_EVALUAR_MESSAGE`.
- En `/evaluar`, incluir una referencia liviana al contexto sin copiar toda la situación elegida:

```text
Hola Ramiro, completé la orientación del sitio sobre movilidad/recuperación y quería consultar por una primera evaluación a domicilio.
```

- Agregar un campo analítico opcional a `trackGenerateLead`, como `cta_context`, para servicios (`post_operatoria`, `adultos_mayores`, etc.) y ramas de `/evaluar`.

Recomiendo hacer Patch 2 solo si después del Patch 1 se necesita medir mejor por intención. No es imprescindible para validar la hipótesis principal.

## 12. Tests recomendados

Patch 1:

- Actualizar `src/lib/whatsapp-messages.test.ts`:
  - validar que el mensaje global contiene "Hola Ramiro";
  - validar que no contiene `Zona/barrio:`, `Motivo de consulta:` ni `Edad aproximada`;
  - validar que no contiene `valor` si se decide mover precio a la respuesta posterior.
- Agregar tests simples para helpers nuevos si se centralizan mensajes contextuales.
- No hace falta test end-to-end si solo cambia copy, salvo que se quiera asegurar que cada CTA renderiza el `href` esperado.

Patch 2:

- Testear que cada servicio genera un mensaje distinto.
- Testear que `/evaluar` puede enviar contexto/rama si se agrega `cta_context`.
- Si se toca analytics, agregar test unitario o de contrato para los parámetros enviados por `trackGenerateLead`.

## 13. Métricas a observar después del cambio

Métricas cuantitativas:

- Clicks `generate_lead` por `cta_location`.
- Ratio aproximado de conversaciones efectivas sobre clicks de WhatsApp.
- Cantidad de mensajes entrantes que llegan con texto pre-cargado intacto, modificado o borrado.
- Cantidad de conversaciones que responden la primera pregunta de pre-calificación.
- Distribución por superficie: Header/Footer vs Hero vs Services vs `/evaluar`.

Métricas cualitativas:

- Si el usuario abre con una necesidad más natural y menos formato formulario.
- Si hay más consultas "hola/precio" sin contexto útil.
- Si mencionar modalidad particular en la primera respuesta filtra suficientemente sin cortar el inicio.
- Si `/evaluar` trae usuarios con más contexto y mejor predisposición a responder datos.

Ventana sugerida:

- Revisar 30 días o al menos un volumen suficiente de conversaciones para evitar decidir por anécdotas aisladas.

## 14. No-alcances

- No implementar cambios todavía.
- No modificar `/admin`.
- No cambiar GA4 salvo recomendación explícita futura.
- No agregar formularios públicos.
- No agregar self-booking.
- No agregar chatbots ni automatizaciones externas.
- No cambiar el posicionamiento principal de la landing como superficie pública de captación.
- No resolver todavía modelado formal de canal WhatsApp en datos clínico-administrativos.
- No usar el primer mensaje para pedir todos los datos operativos si el objetivo principal es aumentar inicio de conversación.

## 15. Archivos revisados

- `src/components/WhatsAppButton.tsx`
- `src/lib/config.ts`
- `src/lib/analytics.ts`
- `src/lib/whatsapp-messages.ts`
- `src/lib/whatsapp-messages.test.ts`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/hero/hero.tsx`
- `src/app/hero/heroContent.ts`
- `src/app/home/components/AboutSection.tsx`
- `src/app/home/components/HowItWorksSection.tsx`
- `src/app/home/components/ServiceContextBanner.tsx`
- `src/app/home/homeContent.ts`
- `src/app/home/howItWorksContent.ts`
- `src/app/(public)/services/page.tsx`
- `src/app/(public)/services/servicesPageContent.ts`
- `src/app/(public)/services/components/ServiceCard.tsx`
- `src/app/(public)/services/components/ServicesGrid.tsx`
- `src/lib/servicesData.ts`
- `src/app/(public)/evaluar/page.tsx`
- `src/app/(public)/evaluar/evaluar-content.ts`
- `src/app/(public)/evaluar/components/EvaluarFlow.tsx`
- `src/app/(public)/evaluar/types.ts`
- `docs/fuente-de-verdad-operativa.md`
- `README.md`

## Nota sobre documentación fuente de verdad

`README.md` no requiere actualización por esta auditoría porque no se implementó cambio de producto ni comportamiento nuevo.

`docs/fuente-de-verdad-operativa.md` tampoco requiere actualización todavía. Sí debería actualizarse cuando se implemente Patch 1, porque ese documento ya registra la landing pública, `/evaluar`, contacto por WhatsApp y analítica GA4 como parte de la operación vigente.
