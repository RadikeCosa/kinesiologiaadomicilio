# Kinesiología a Domicilio

Landing page desarrollada con Next.js para un servicio de kinesiología y rehabilitación a domicilio en Neuquén, Argentina.

## Estado actual (abril 2026)

El proyecto está en etapa **sitio de captación** (sin backend transaccional).

### Rutas públicas implementadas
- `/` (home)
- `/services` (servicios)
- `/evaluar` (flujo guiado para orientar si conviene consultar)

### Funcionalidad disponible
- Header y footer globales.
- CTA de WhatsApp reutilizable en múltiples superficies.
- Link telefónico en footer.
- Sección de servicios con catálogo centralizado.
- Flujo interactivo en `/evaluar` con ramas de orientación y CTA contextual de WhatsApp.
- SEO técnico base (metadata, Open Graph/Twitter, JSON-LD, `robots.txt`, `sitemap.xml`).
- GA4 integrado de forma directa (sin GTM) con eventos custom.

### Fuentes de verdad principales
- `src/lib/config.ts`: datos del negocio/contacto/base URL.
- `src/app/services/data/servicesData.ts`: catálogo de servicios.
- `src/lib/navLinks.ts`: navegación global (header/footer).
- `src/app/hero/heroContent.ts`: copy del hero.
- `src/app/home/homeContent.ts` y `src/app/home/howItWorksContent.ts`: contenido editorial de Home.
- `src/app/evaluar/evaluar-content.ts`: contenido del flujo `/evaluar`.

## Stack real

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **ESLint**

## Scripts disponibles

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Desarrollo local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Levantar entorno local:
   ```bash
   npm run dev
   ```
3. Abrir:
   - `http://localhost:3000`

Checks recomendados antes de merge:

```bash
npm run lint
npm run build
```
