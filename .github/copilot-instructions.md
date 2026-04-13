# Instrucciones para agentes de IA (Copilot)

Última actualización: 2026-04-13  
Responsable / Contacto: @RadikeCosa

Propósito: orientar a asistentes IA (Copilot, chatbots) y colaboradores humanos sobre arquitectura, convenciones, SEO y flujo de trabajo del proyecto "Kinesiología a Domicilio".

---

## 1. Resumen del proyecto
- Stack: Next.js (App Router), TypeScript, Tailwind CSS, Vercel (deploy objetivo).
- UI y rutas: `src/app/` (puntos clave: `page.tsx`, `layout.tsx`).
- Componentes UI: `src/components/`.
- Estilos globales: `src/app/globals.css`.
- Assets públicos (SVGs, íconos, imágenes optimizadas): `public/`.

---

## 2. Ámbito de estas instrucciones
- Qué cubre: estructura del repo, convenciones de código, prácticas SEO y guía para prompts dirigidos a Copilot.
- Qué no cubre: cambios de infraestructura (servidores, bases de datos) o credenciales sensibles. Antes de tocar infra, consultar al responsable.

---

## 3. Arquitectura y patrones
- Usar App Router (`src/app/`); páginas y layouts como funciones React.
- Estilos con Tailwind (utility-first) directamente en JSX. Evitar CSS modules salvo excepción justificada.
- Componentes: sin estado cuando sea posible; extraer lógica compleja a hooks (`src/hooks/`) o servicios (`src/lib/`).
- Imágenes: preferir `next/image` y formatos modernos (WebP/AVIF) en `public/`.

---

## 4. Convenciones de código
- Lenguaje: TypeScript estricto (siempre tipos explícitos en APIs públicas).
- Nombres: componentes en PascalCase, hooks con `use` prefix, utilidades en camelCase.
- Accessibility: usar HTML semántico, atributos `aria-*` cuando corresponda, `alt` descriptivos en todas las imágenes.
- Responsive: enfoque mobile-first con breakpoints `sm`, `md`, `lg`.
- Evitar librerías pesadas; preferir soluciones nativas o utilitarias.

---

## 5. Archivo clave y rutas rápidas
- `src/app/page.tsx` — Página principal.
- `src/app/layout.tsx` — Layout global; contiene lang, JSON-LD `MedicalBusiness`.
- `src/app/globals.css` — Estilos globales y carga de fuentes.
- `public/` — Imágenes y SVGs.
- `eslint.config.mjs` — Reglas de lint.
- `README.md` — Flujo de trabajo básico.

---

## 6. Flujo de trabajo y commits
- Divide tareas grandes en pasos pequeños y verificables.
- Commits frecuentes y atómicos. Convención recomendada: Conventional Commits.
  - Ejemplos:
    - `feat: agrega sección de contacto responsiva`
    - `fix: corrige alineación del footer`
    - `docs: actualiza instrucciones de despliegue`
- Antes de commit: ejecutar build y lint (`pnpm build && pnpm lint` o `npm run build`, según scripts).
- Ramas: `feature/`, `fix/`, `hotfix/`. PR hacia `main`.

---

## 7. Guía rápida para SEO (operativa)
- Metadata: cada página de servicio debe exportar `metadata` con `title` y `description` claros.
  - Title ≤ 60 chars; description 140–160 chars.
  - Ejemplo:
    ```ts
    export const metadata = {
      title: "Kinesiología a domicilio — Rehabilitación postoperatoria | Ciudad",
      description: "Sesiones de kinesiología a domicilio para recuperación postoperatoria. Turnos rápidos y personalizados. Llamá al WhatsApp.",
    }
    ```
- Estructura de encabezados: 1 único `h1` por página; usar `h2` / `h3` para secciones.
- Contenido inicial por servicio: mínimo ~90 palabras en la intro + beneficios, proceso, indicaciones y CTA (WhatsApp).
- Interlinking: cada servicio enlaza al hub `/servicios`, a otro servicio relacionado y a `/contacto`.

---

## 8. Structured Data (JSON-LD)
- Mantener `MedicalBusiness` en `layout.tsx`. Actualizar si cambia teléfono/servicios.
- `FAQPage`: sólo en `/faq` o páginas que realmente contengan la FAQ; evitar duplicar preguntas.
- `BreadcrumbList`: añadir cuando haya profundidad en rutas (`/servicios/…`).
- Blog futuro: usar `Article`/`BlogPosting` con `author` y `datePublished`.

---

## 9. Performance & accesibilidad
- Usar `next/image` y optimizar imágenes (preferir < 200 KB; WebP/AVIF).
- Lighthouse goals (local): Performance ≥ 90, SEO ≥ 90, Accessibility ≥ 90.
- Evitar librerías grandes si una utilidad nativa basta.

---

## 10. Checklist para PRs (rúbrica mínima)
- [ ] Title único y correcto (≤ 60 chars, sin keyword stuffing).
- [ ] Meta description única y orientada a CTA/beneficio.
- [ ] H1 único y coherente con intención.
- [ ] Imágenes optimizadas y `alt` descriptivos.
- [ ] Sitemap actualizado (`app/sitemap.ts`) si se añaden rutas públicas.
- [ ] Schema (JSON-LD) válido si aplica (FAQ/Breadcrumb/Article).
- [ ] Lighthouse local: A11y y SEO favorables.
- [ ] No anchors rotos ni enlaces 404.

---

## 11. Mantenimiento periódico
- Revisión trimestral:
  - Revisar Google Search Console y queries nuevas.
  - Auditar Core Web Vitals (Vercel / PageSpeed).
  - Validar JSON-LD tras cambios estructurales.

---

## 12. Buenas prácticas para prompts a Copilot / Chat
- Sé específico: "Generá un componente React TypeScript que...".
- Incluir contexto: ruta, archivo objetivo, y responsabilidad (ej: `src/components/Header.tsx`).
- Indicar restricciones: "sin dependencias externas", "accessible", "tailwind classes only".
- Ejemplos de prompts:
  - "Escribe un componente Button en TypeScript que acepte props: label, onClick, variant ('primary'|'ghost') y componga clases Tailwind. Incluir tests unitarios ¿sí/no?>"
  - "Refactorizá la parte X en `src/app/page.tsx` para extraer un componente `Hero` y mover estilos a Tailwind utility classes. Mantener comportamiento actual."

---

## 13. Ejemplo: Componente Button (plantilla rápidamente usable)
```tsx
// name=src/components/Button.tsx
import React from "react";

type Variant = "primary" | "ghost";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: Variant;
}

export const Button: React.FC<ButtonProps> = ({ label, variant = "primary", ...rest }) => {
  const base = "px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = variant === "primary"
    ? `${base} bg-emerald-600 text-white hover:bg-emerald-700`
    : `${base} bg-transparent text-emerald-600 hover:bg-emerald-50 border border-emerald-100`;

  return (
    <button className={styles} {...rest}>
      {label}
    </button>
  );
};
```

---

## 14. Qué puede y no puede hacer el agente IA (reglas)
- Puede: proponer cambios de UI, refactorizar componentes, generar snippets, preparar PRs/commits sugeridos.
- No puede (sin autorización humana): tocar credenciales, realizar despliegues en producción, borrar datos de usuarios, modificar configuraciones sensibles.

---

## 15. Propuestas de mejora inmediata (prioritarias)
1. Corregir y reemplazar este archivo (ya propuesto aquí).
2. Añadir un template de PR y/o ISSUE (en `.github/`) con la checklist SEO integrada.
3. Automatizar validación básica en CI: lint + build + pruebas + Lighthouse snapshot (opcional).
4. Centralizar helper para JSON-LD (`src/lib/jsonld.ts`) para evitar duplicación.

---

Si querés, puedo:
- Crear un PR con este cambio (necesito confirmar repo/branch objetivo), o
- Generar el template de PR y el issue template `.github/PULL_REQUEST_TEMPLATE.md` y `.github/ISSUE_TEMPLATE/bug.md`.
