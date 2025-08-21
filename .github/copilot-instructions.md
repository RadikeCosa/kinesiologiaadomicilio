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

---

Si alguna convención o flujo no está claro, consulta al usuario antes de hacer cambios.
