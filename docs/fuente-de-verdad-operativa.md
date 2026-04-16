# Fuente de verdad operativa del proyecto

> Última actualización: 2026-04-15 (UTC)

## 1) Resumen ejecutivo

El repositorio implementa una **landing de captación local** para kinesiología a domicilio en Neuquén.
No hay sistema de turnos, login, panel administrativo ni backend de negocio.

## 1.1) Dirección evolutiva del proyecto (decisión de encuadre)

- **Estado actual**: este repo sigue siendo una landing pública de captación local.
- **Dirección aceptada**: existe intención de evolucionar a futuro hacia una **app clínica conviviente en el mismo repositorio**.
- **Límite explícito**: esa evolución futura **todavía no está implementada** en código.
- **Foco funcional inicial previsto** (solo dirección, no estado implementado):
  - alta de paciente;
  - contacto principal / quién escribe;
  - dirección y contexto inicial;
  - tratamiento activo (EpisodeOfCare);
  - visitas / encuentros.
- **Fuera de alcance inicial previsto**:
  - agenda;
  - pagos;
  - autogestión de turnos (self-booking);
  - multiusuario / auth compleja;
  - panel administrativo completo.

### Aclaración de límites documentales

- No documentar capacidades futuras como si existieran hoy.
- No reinterpretar el repo actual como si ya fuera una app clínica.

## 2) Estado actual confirmado en código

### Rutas públicas
- `/` (home)
- `/services`
- `/evaluar`

### Capacidades actuales
- Navegación global en header/footer.
- Catálogo de servicios con cards + CTA.
- Flujo de orientación en `/evaluar` (selección de situación, resultado y CTA de consulta).
- Contacto por WhatsApp y teléfono.
- SEO técnico base:
  - Metadata global + metadata por ruta.
  - Open Graph/Twitter.
  - JSON-LD `MedicalBusiness`.
  - `robots.txt` y `sitemap.xml`.
- Analítica con GA4 directo (sin GTM):
  - `generate_lead`
  - `phone_click`
  - `scroll_50`
  - `scroll_90`

## 3) Fuentes de verdad activas

| Dominio | Fuente primaria |
| --- | --- |
| Datos del negocio/contacto/base URL | `src/lib/config.ts` |
| Catálogo de servicios | `src/app/services/data/servicesData.ts` |
| Navegación global | `src/lib/navLinks.ts` |
| Hero (copy editorial) | `src/app/hero/heroContent.ts` |
| Home (copy editorial) | `src/app/home/homeContent.ts` |
| Home “Cómo funciona” | `src/app/home/howItWorksContent.ts` |
| Flujo `/evaluar` | `src/app/evaluar/evaluar-content.ts` |
| Tracking GA4 | `src/lib/analytics.ts` |

## 4) Observaciones técnicas relevantes

1. `/evaluar` está implementada y enlazada desde Home.
2. `sitemap.ts` actualmente publica solo `/` y `/services` (no incluye `/evaluar`).
3. Header/Footer comparten `NAV_LINKS`; `/evaluar` no figura en esa navegación global (acceso principal desde CTA de Home).
4. La ausencia de `/evaluar` en sitemap se registra como **punto abierto a revisar** (no hay evidencia documental/código para afirmar deuda priorizada ni decisión definitiva).

## 5) Mantenimiento recomendado

- Si cambia contacto, URL base o ubicación: editar `src/lib/config.ts` y revisar `layout.tsx`, `robots.ts`, `sitemap.ts`.
- Si cambia catálogo de servicios: editar `servicesData.ts` y revisar consumidores (`ServicesGrid`, footer, hero, JSON-LD).
- Si cambia copy editorial:
  - Hero: `heroContent.ts`
  - Home: `homeContent.ts` / `howItWorksContent.ts`
  - Evaluar: `evaluar-content.ts`

## 6) Estado de validación local

- `npm run lint`: pasa.
- `npm run build`: pasa.
