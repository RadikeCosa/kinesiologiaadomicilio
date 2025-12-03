# 🏥 Kinesiología a Domicilio — Landing Page

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com/)

> 🚧 **Proyecto en construcción** — Landing page profesional para un servicio de kinesiología y rehabilitación a domicilio en Neuquén, Argentina.

## 🌐 Demo en Vivo

🔗 **[kinesiologiaadomicilio.vercel.app](https://kinesiologiaadomicilio.vercel.app)**

---

## 📋 Descripción del Proyecto

Landing page moderna y optimizada para un negocio de kinesiología domiciliaria. El sitio está diseñado para convertir visitantes en clientes mediante una experiencia de usuario fluida y un fuerte enfoque en SEO local.

### Objetivos del Proyecto

- **Conversión**: CTA prominentes con integración directa a WhatsApp
- **SEO Local**: Posicionamiento para búsquedas de kinesiología en Neuquén
- **Performance**: Carga rápida y excelente puntuación en Core Web Vitals
- **Accesibilidad**: Cumplimiento de estándares WCAG

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 15.4 (App Router) |
| **UI Library** | React 19 |
| **Lenguaje** | TypeScript 5 |
| **Estilos** | Tailwind CSS 4 |
| **Linting** | ESLint 9 |
| **Deploy** | Vercel |

---

## ✨ Características Implementadas

### 🎨 Diseño & UI
- ✅ **Responsive Design** — Mobile-first con breakpoints para tablet y desktop
- ✅ **Dark Mode** — Soporte nativo para tema claro/oscuro según preferencias del sistema
- ✅ **Componentes Reutilizables** — Arquitectura modular con componentes aislados
- ✅ **Hero Section** — Diseño impactante con imagen optimizada y CTAs claros

### 🔍 SEO & Marketing
- ✅ **Metadata Dinámica** — Títulos y descripciones únicas por página
- ✅ **Open Graph & Twitter Cards** — Preview optimizado para redes sociales
- ✅ **JSON-LD Schema** — Structured data `MedicalBusiness` para rich snippets
- ✅ **Sitemap Dinámico** — Generación automática de sitemap.xml
- ✅ **Robots.txt** — Configuración para crawlers
- ✅ **Canonical URLs** — URLs canónicas para evitar contenido duplicado

### ♿ Accesibilidad
- ✅ **Skip Links** — Navegación por teclado para saltar al contenido principal
- ✅ **ARIA Labels** — Etiquetas semánticas para lectores de pantalla
- ✅ **HTML Semántico** — Uso correcto de elementos `<main>`, `<nav>`, `<header>`, `<footer>`
- ✅ **Landmarks** — Regiones navegables para tecnologías asistivas

### ⚡ Performance
- ✅ **Static Generation** — Páginas pre-renderizadas para carga instantánea
- ✅ **Turbopack** — Build system ultra-rápido en desarrollo
- ✅ **Imágenes Optimizadas** — Formato WebP con next/image
- ✅ **Font Optimization** — Carga optimizada de tipografías

### 🔧 Arquitectura
- ✅ **App Router** — Arquitectura moderna de Next.js 15
- ✅ **Configuración Centralizada** — Datos de negocio en archivo de config
- ✅ **Type Safety** — Tipado estricto con TypeScript
- ✅ **Separación de Concerns** — Componentes, datos y tipos organizados

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── hero/              # Sección hero
│   │   ├── components/    # HeroImage, HeroSecondaryLink, HeroServiceTypesList
│   │   └── hero.tsx       # Componente principal del hero
│   ├── services/          # Página de servicios
│   │   ├── components/    # ServiceCard, ServicesGrid
│   │   ├── data/          # Datos de servicios
│   │   └── types/         # Interfaces TypeScript
│   ├── layout.tsx         # Layout raíz con metadata global
│   ├── page.tsx           # Página principal
│   ├── sitemap.ts         # Sitemap dinámico
│   └── globals.css        # Estilos globales
├── components/            # Componentes compartidos
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── WhatsAppButton.tsx
│   ├── WhatsAppIcon.tsx
│   └── ScrollDownButton.tsx
└── lib/
    └── config.ts          # Configuración centralizada del negocio
```

---

## 🚀 Instalación y Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/RadikeCosa/kinesiologiaadomicilio.git
cd kinesiologiaadomicilio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
open http://localhost:3000
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Genera el build de producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint para verificar código |

---

## 📊 Habilidades Demostradas

Este proyecto demuestra competencias en:

- **Frontend Development** — React, Next.js, TypeScript
- **CSS & Design Systems** — Tailwind CSS, responsive design, dark mode
- **SEO Técnico** — Metadata, structured data, sitemaps
- **Web Performance** — Optimización de imágenes, SSG, code splitting
- **Accesibilidad Web** — WCAG, ARIA, navegación por teclado
- **Buenas Prácticas** — Clean code, arquitectura modular, type safety

---

## 🗺️ Roadmap

- [ ] Página de contacto con formulario
- [ ] Blog con artículos sobre rehabilitación
- [ ] Testimonios de pacientes
- [ ] Integración con Google Analytics
- [ ] PWA (Progressive Web App)
- [ ] Internacionalización (i18n)

---

## 📄 Licencia

Este proyecto es privado y está en desarrollo activo.

---

## 👤 Autor

**Radike Cosa**

- GitHub: [@RadikeCosa](https://github.com/RadikeCosa)

---

> 💼 *¿Interesado en mi trabajo? No dudes en contactarme para oportunidades laborales.*
