# Instrucciones para asistentes IA

## 1) Propósito de este archivo
Esta guía define cómo colaborar en este repositorio **según su estado real actual**. Sirve para asistentes IA y personas que hagan cambios rápidos sin agregar complejidad innecesaria.

Proyecto hoy: landing de **kinesiología a domicilio en Neuquén** orientada a presentación del servicio y captación por WhatsApp.

## 2) Resumen real del proyecto
- Etapa: **MVP / evolución temprana**.
- Objetivo actual: comunicar propuesta de valor + facilitar contacto.
- Flujos principales implementados:
  - Home (`/`) con hero y CTA.
  - Página de servicios (`/services`) con listado y CTA a WhatsApp.
  - Ruta pública `/evaluar` con contenido propio y CTA de contacto.
- Estado actual de `/evaluar` dentro del producto:
  - Sí está implementada e instrumentada en analytics.
  - No está en la navegación global principal (header/footer).
  - No figura en el sitemap actual.
- No asumir procesos de producto “maduros” que hoy no existen.

## 3) Stack y estructura real
Tecnologías y estructura actualmente en uso:
- Next.js (App Router) + React + TypeScript.
- Tailwind CSS (enfoque utility-first).
- ESLint (vía script `npm run lint`).

Rutas/archivos clave:
- `src/app/layout.tsx`: layout global, metadata principal y JSON-LD.
- `src/app/page.tsx`: landing principal.
- `src/app/services/page.tsx`: página de servicios.
- `src/app/sitemap.ts`: sitemap actual.
- `src/lib/config.ts`: datos de negocio/contacto y helper de WhatsApp.
- `src/components/`: componentes compartidos.
- `public/`: assets estáticos y `robots.txt`.

## 4) Reglas de trabajo para asistentes IA
- No inventar features, rutas o flujos no implementados.
- No documentar como existente lo que no está en código (tests, CI/CD, analytics, formularios propios, etc.).
- Mantener cambios pequeños, verificables y consistentes con la estructura actual.
- Priorizar simplicidad: resolver con lo que ya existe antes de sumar nuevas capas.
- Evitar dependencias pesadas salvo justificación clara.
- Si se modifica contenido técnico o funcional, actualizar documentación relacionada para evitar drift.
- Tratar la landing pública actual y una futura app clínica como **dominios distintos**, aunque convivan en el mismo repo.
- No asumir por defecto como siguiente paso: agenda, pagos, turnero/self-booking, auth compleja o multiusuario.
- Si se proponen evoluciones funcionales, priorizar conceptualmente:
  - patient intake;
  - contacto principal;
  - tratamiento activo;
  - visitas.
- Cualquier cambio que altere este encuadre debe mantener alineada `docs/fuente-de-verdad-operativa.md`.

## 5) Convenciones de implementación
- Respetar App Router y organización actual de carpetas.
- TypeScript en componentes y utilidades.
- Tailwind utility-first para estilos.
- Mobile-first y accesibilidad básica (HTML semántico, `alt`, labels/aria cuando aplique).
- Reutilizar componentes compartidos cuando tenga sentido; no sobre-componentizar.
- Cuando convenga, centralizar datos repetidos en `src/lib/config.ts`; si hoy quedan partes repartidas, mantenerlas consistentes y evitar duplicación innecesaria.

## 6) SEO, metadata y structured data (estado actual)
- Existe metadata global en `src/app/layout.tsx` y metadata específica en `src/app/services/page.tsx`.
- Canonical está definido en metadata.
- Hay JSON-LD tipo `MedicalBusiness` embebido en `layout.tsx`.
- Existe sitemap (`src/app/sitemap.ts`) y `public/robots.txt`.

Cuidado importante:
- Evitar desalineación entre datos en `src/lib/config.ts` y valores hardcodeados en metadata/JSON-LD.
- Si se cambia teléfono, nombre, URL, ubicación o servicios, revisar ambos lugares.
- No declarar “arquitectura SEO robusta”: el baseline es bueno para MVP, pero simple.

## 7) Checklist operativo antes de cerrar cambios
1. Revisar archivos impactados y mantener consistencia entre sí.
2. Evitar duplicación de texto/datos/configuración.
3. Ejecutar `npm run lint`.
4. Ejecutar `npm run build` cuando el cambio afecte rutas, metadata, render o estructura.
5. Confirmar que README y esta guía no queden desalineados con el código.

## 8) Qué evitar en este repo
- Inventar rutas, scripts o comandos que no existen en `package.json`.
- Introducir abstracciones grandes para problemas pequeños.
- Agregar librerías grandes sin necesidad comprobable.
- Dejar documentación inconsistente con el comportamiento real.
- Tocar metadata/SEO/JSON-LD sin verificar impacto y consistencia.
- Presentar el proyecto como si ya tuviera operación de equipo grande (procesos, QA, automatizaciones) cuando no aplica.
