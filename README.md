# 🏥 Kinesiología a Domicilio — Landing Page

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Deploy (Vercel)](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com/)

Breve: Landing page modern y accesible para un servicio de kinesiología y rehabilitación a domicilio en Neuquén, Argentina — enfocada en conversión local (WhatsApp CTA), rendimiento y SEO local.

Demo en vivo
🔗 https://kinesiologiaadomicilio.vercel.app

Preview
![Preview](public/images/preview.png) <!-- Añade una captura en public/images/preview.png -->

Contenido rápido
- Estado: En desarrollo (alpha)
- Stack: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- Deploy: Vercel

Tabla de contenido
- Descripción
- Características
- Pre-requisitos
- Quick start
- Scripts
- Estructura del proyecto
- Configuración (qué editar)
- Accesibilidad y rendimiento
- Roadmap
- Contribuir
- Licencia y contacto

Descripción
Landing page optimizada para convertir visitantes locales en pacientes, con foco en:
- CTA directo a WhatsApp
- SEO local (Neuquén)
- Accesibilidad (WCAG)
- Alto rendimiento (Core Web Vitals)

Características principales
- Responsive + mobile-first
- Dark mode automático
- Metadata dinámica, Open Graph y JSON-LD (MedicalBusiness)
- Sitemap y robots.txt generados
- Componentes React reutilizables y tipados con TypeScript
- Imagen optimizada con next/image (WebP)
- Preparado para desplegar en Vercel

Pre-requisitos
- Node.js >= 18 (recomendado 18.x o 20.x)
- npm, pnpm o yarn
- Git

Quick start (local)
1. Clona el repo
   git clone https://github.com/RadikeCosa/kinesiologiaadomicilio.git
   cd kinesiologiaadomicilio

2. Instala dependencias (elige uno)
   npm install
   # o
   # pnpm install

3. Ejecuta en desarrollo
   npm run dev
   # abre http://localhost:3000

Build y preview de producción
   npm run build
   npm run start
   # o para preview en local
   npm run build
   npm run preview

Scripts disponibles
| Comando | Descripción |
|--------:|------------|
| `npm run dev` | Inicia el servidor de desarrollo (Turbopack) |
| `npm run build` | Genera build de producción |
| `npm run start` | Inicia la app en modo producción |
| `npm run preview` | Preview del build local |
| `npm run lint` | Ejecuta ESLint |

Estructura del proyecto
src/
├── app/
│   ├── hero/              # Sección hero
│   │   ├── components/
│   │   └── hero.tsx
│   ├── services/          # Página de servicios
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/            # Componentes compartidos (Header, Footer, WhatsAppButton...)
└── lib/
    └── config.ts          # Configuración central (editar aquí datos del negocio)

Qué editar (configuración del negocio)
- Abre `src/lib/config.ts` y actualiza:
  - Nombre del negocio
  - Teléfono y plantilla de WhatsApp (deeplink)
  - Ciudad / dirección para Schema y SEO
  - Horarios si aplica
- Reemplaza la imagen `public/images/preview.png` con una captura real.

SEO, Social y Open Graph
- Metadata dinámica en el layout
- JSON-LD con tipo `MedicalBusiness` ya configurado (editar datos en config.ts)
- Añadir `og:image` (usa /public/images/og-image.png) para mejores previews

Accesibilidad y Performance
- Se agregaron skip links, ARIA attributes y landmarks semánticos.
- Para auditar: ejecutar Lighthouse en Chrome (Performance / Accessibility / SEO).
- Recomendación: ejecutar `npm run build` y revisar Core Web Vitals en la página desplegada en Vercel.

Tests / Lint
- ESLint: `npm run lint`
- (Si añades testing) recomiendo configurar Vitest / Playwright para pruebas unitarias y end-to-end.

Deployment
- Deploy automático en Vercel. Conectar el repo y configurar variables de entorno en el dashboard de Vercel si fuera necesario.
- Si quieres usar GitHub Actions: añade un workflow para CI (lint, build, test).

Roadmap (rápido)
- [ ] Página de contacto con formulario
- [ ] Blog y artículos sobre rehabilitación
- [ ] Testimonios y casos de éxito
- [ ] Integración con Google Analytics / Consentimiento de cookies
- [ ] PWA (instalable) y i18n

Contribuir
1. Abre un issue describiendo la propuesta.
2. Crea una rama: `feature/descripcion-corta`
3. Haz PR con descripción y capturas si corresponde.
4. Sigue el estilo de código y corre `npm run lint`.

Sugerencias adicionales (para añadir a repo)
- Añadir `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` y plantillas en `.github/ISSUE_TEMPLATE` y `.github/PULL_REQUEST_TEMPLATE`.
- Añadir badge de CI (GitHub Actions) / Vercel en la parte superior cuando estén activos.
- Añadir screenshots en `public/images/` y generar `og-image.png`.

Licencia
Este proyecto es privado y está en desarrollo activo. Para usos o licencias, contacta a:
**Radike Cosa** — https://github.com/RadikeCosa

Contacto
- GitHub: [@RadikeCosa](https://github.com/RadikeCosa)
- Email: <tu-email@ejemplo.com> (reemplaza con tu email profesional)

Gracias por ver el proyecto — si quieres, aplico estos cambios en un PR y agrego:
- Capturas (si me pasas imágenes)
- Badges de CI/Vercel
- CONTRIBUTING + CODE_OF_CONDUCT
