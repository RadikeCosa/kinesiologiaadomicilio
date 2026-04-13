# Kinesiología a Domicilio

Landing page desarrollada con Next.js para un servicio de kinesiología y rehabilitación a domicilio en Neuquén, Argentina. Hoy funciona como sitio de presentación con navegación simple y llamados a la acción (CTA) hacia WhatsApp.

## Estado actual del proyecto

Este repositorio está en una etapa **MVP / evolución temprana**.

Actualmente incluye:
- Página principal con hero y acceso rápido a servicios.
- Página de servicios con listado y CTA de consulta por WhatsApp.
- Header y footer con navegación básica.
- Configuración de datos del negocio (nombre, teléfono, ubicación y URL) usada por navegación y contacto.
- Metadata SEO básica, Open Graph/Twitter y JSON-LD tipo `MedicalBusiness`.
- Sitemap y `robots.txt`.

No incluye por ahora tests automatizados, CI/CD en GitHub Actions ni formularios propios. La medición base con Google Analytics 4 sí está implementada en el código.

## Stack real

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4** (vía `@tailwindcss/postcss`)
- **ESLint** con configuración de Next.js

## Estructura general

Rutas y carpetas principales:

- `src/app/`: rutas de la app (home, servicios), layout global, estilos, `sitemap.ts` y `robots.ts`.
- `src/app/services/`: página de servicios, tipos, data y componentes de cards/grilla.
- `src/components/`: componentes compartidos (Header, Footer, botones, etc.).
- `src/lib/config.ts`: datos de contacto y helper para links de WhatsApp.
- `public/`: assets estáticos (`hero-image.webp`, `og-placeholder.png`).
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`: configuración del proyecto.

## Scripts disponibles

Scripts reales definidos en `package.json`:

- `npm run dev`: inicia el servidor de desarrollo con Turbopack.
- `npm run build`: genera la build de producción.
- `npm run start`: levanta la app en modo producción (requiere build previa).
- `npm run lint`: ejecuta ESLint.

## Desarrollo local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar entorno de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en navegador:
   - `http://localhost:3000`

Validación básica recomendada antes de cambios relevantes:

```bash
npm run lint
npm run build
```

Para validar producción local:

```bash
npm run build
npm run start
```

## Convenciones y notas útiles

- Se usa **App Router** (`src/app`) como estructura principal de rutas.
- Los estilos están implementados con **Tailwind utilities** y estilos globales en `src/app/globals.css`.
- `src/lib/config.ts` concentra datos de contacto usados por componentes y links de WhatsApp; parte de la metadata/JSON-LD sigue definida en `src/app/layout.tsx`.
- Los assets públicos viven en `public/`.
- Se utiliza la variable de entorno `NEXT_PUBLIC_GA_ID` para inyectar Google Analytics 4 desde el layout global.
- Deploy objetivo: **Vercel**
