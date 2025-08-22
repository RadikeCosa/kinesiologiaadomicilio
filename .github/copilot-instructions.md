# Instrucciones para agentes de IA (Copilot)

## Project Overview

Este es un proyecto Next.js (TypeScript, Tailwind CSS) para "Kinesiologia a Domicilio".
La UI principal y el ruteo están en `src/app/` (especialmente `page.tsx`, `layout.tsx`).
Los componentes están en `src/components/`.
Los estilos globales y la configuración de fuentes en `src/app/globals.css`.
Los assets públicos (SVGs, íconos) están en `public/`.

## Architecture & Patterns

Usa el App Router de Next.js (`src/app/`).
El estilo se realiza con utilidades de Tailwind CSS directamente en JSX.
Las fuentes se cargan y optimizan con `next/font` (ver `globals.css`).
Los layouts son responsivos usando breakpoints de Tailwind (`sm:` y otros).
Todas las páginas y componentes son funciones React.

## Conventions & Tips

Usa Tailwind para todo el estilo; evita CSS modules o estilos inline.
Coloca UI compartida en `src/components/`, no en `app/`.
Usa HTML semántico y buenas prácticas de accesibilidad.
Mantén la lógica de las páginas mínima; prefiere componentes sin estado.
Usa SVGs desde `public/` para íconos e imágenes.
La fuente se define globalmente; usa `font-sans` para texto principal.
No hay servidor personalizado, API ni integración con base de datos.
Diseño mobile-first: define primero estilos base para pantallas pequeñas y luego añade mejoras progresivas con breakpoints (`sm:`, `md:`, etc.). Evita sobre-especificar en móviles para reducir CSS.
Refactor por componentes: extrae piezas reutilizables (botones genéricos, layouts, elementos de navegación) a `src/components/`. Elementos específicos de una sección (ej: partes internas del hero) pueden vivir en una subcarpeta local `src/app/hero/` para mantener cohesión sin contaminar el espacio global. Si un componente local se reutiliza en otra sección, muévelo después a `src/components/`.

## Key Files

`src/app/page.tsx`: Página principal.
`src/app/layout.tsx`: Layout global.
`src/app/globals.css`: Estilos globales y fuentes.
`public/`: Assets estáticos.
`eslint.config.mjs`: Reglas de lint.
`README.md`: Información y flujo de trabajo básico.

## Workflow & Commit Best Practices

- Realiza los cambios de manera **paso a paso**: divide tareas grandes en pasos pequeños y verifica el resultado en cada etapa.
- Haz **commits frecuentes** y descriptivos, usando convenciones populares como Conventional Commits (`feat:`, `fix:`, `docs:`, etc.) o mensajes claros y concisos.
- Ejemplo de commit: `feat: agrega sección de contacto responsiva` o `fix: corrige alineación en el footer`.
- Antes de cada commit, asegúrate de que el código compile y pase el lint.
- Prefiere commits pequeños y atómicos para facilitar revisiones y revertir cambios si es necesario.
- Usa **ramas de desarrollo** siguiendo convenciones comunes (por ejemplo, `feature/nombre`, `fix/nombre`, `hotfix/nombre`). Haz PRs desde estas ramas hacia `main`.

## SEO (Resumen Operativo)

### Quick Wins Ya Aplicados

- `lang=es-AR` en `layout.tsx`.
- Skip link + `<main>` semántico.
- JSON-LD `MedicalBusiness` inline (layout).
- Sitemap inicial (`app/sitemap.ts`).
- Sección placeholder `#servicios` para evitar anchor roto.

### Al Crear Nuevas Páginas de Servicio

1. Definir keyword primaria + 1–2 secundarias (intención transaccional local).
2. Incluir `export const metadata` con title (≤60 chars) y description única (140–160 chars).
3. Un solo `h1`. Estructurar con `h2`/`h3` ordenados.
4. Contenido mínimo inicial: intro (≥90 palabras), beneficios, proceso, indicaciones, CTA WhatsApp, enlaces internos (hub servicios / contacto / otro servicio relacionado).
5. Actualizar sitemap (`app/sitemap.ts`).
6. Mantener densidad natural (evitar stuffing).

### Structured Data

- Mantener `MedicalBusiness` global en layout (actualizar si cambia teléfono / servicios).
- Añadir `FAQPage` SOLO en página /faq (o sección única) sin duplicar preguntas exactas en múltiples schemata.
- Añadir `BreadcrumbList` cuando exista profundidad (`/servicios/…`).
- Para blog futuro: usar `Article`/`BlogPosting` con autor y fecha.

### Performance & Accesibilidad

- Usar `next/image` siempre; imágenes principales < 200 KB (preferir WebP/AVIF en `public/`).
- Lighthouse objetivo: Performance ≥ 90, SEO ≥ 90, A11y ≥ 90.
- Evitar librerías grandes innecesarias; preferir utilidades nativas.

### Interlinking

- Cada servicio enlaza al hub `/servicios`, a otro servicio relacionado y a contacto.
- Blog (cuando exista) enlaza hacia servicios relevantes y viceversa.

### PR Checklist SEO

- [ ] Title único correcto (sin stuffing, ≤60 chars).
- [ ] Meta description única (CTA / beneficio).
- [ ] H1 único y coherente con intención.
- [ ] Enlaces internos agregados (hub / contacto / relacionados).
- [ ] Sitemap actualizado.
- [ ] Schema válido (si aplica FAQ/Breadcrumb/Article).
- [ ] Imágenes optimizadas (<200 KB) y `alt` descriptivo.
- [ ] Lighthouse A11y & SEO ≥ 90 (local test).
- [ ] No enlaces rotos (anchors existentes).

### Mantenimiento Trimestral

- Revisar Search Console: nuevas queries → decidir nuevas páginas.
- Auditar Core Web Vitals (Vercel / PSI) y ajustar.
- Validar JSON-LD tras cambios estructurales.

### Futuro (Backlog Breve)

- Manifest + theme-color + iconos extendidos.
- Automatizar generación de sitemap a partir del árbol de rutas.
- Helper central para JSON-LD (evitar duplicación).
- FAQ global y expansión blog (clusters temáticos: post-operatorio, cuidados paliativos, adultos mayores).

---

Si alguna convención o flujo no está claro, consulta al usuario antes de hacer cambios.
