# Plan funcional por fases — evolución a app clínica (V1/V2)

> Estado: borrador operativo
> Fecha: 2026-04-16 (UTC)

## 1) Propósito del documento

La landing pública actual se mantiene como superficie activa de captación.

Este documento organiza la evolución funcional por fases hacia una app clínica privada conviviente en el mismo repositorio.

Su objetivo es definir alcance previsto de producto (qué entra, qué no entra y en qué orden), sin describir funcionalidades como si ya estuvieran implementadas.

## 2) Principios del plan

- Priorizar uso profesional real sobre completitud teórica.
- Resolver primero el flujo clínico base del profesional.
- No abrir agenda, pagos ni `/portal` antes de cerrar bien pacientes + tratamiento activo + visitas.
- Mantener alcance chico, verificable y coherente con el estado real del repo.
- Usar este documento como puente entre dirección ya decidida y arquitectura objetivo a documentar después.

## 3) V1 — primera versión funcional de la app clínica privada

V1 se define como la primera versión funcional de uso profesional, con superficie privada en `/admin` como dirección aceptada.

### Incluye explícitamente

- Pacientes.
- Contacto principal / quién escribe.
- Dirección y contexto inicial de consulta.
- EpisodeOfCare / tratamiento activo.
- Visitas / encuentros.
- Historial básico.

### Objetivo de V1

Permitir que el profesional pueda, dentro de una misma superficie privada coherente:

- Registrar paciente y contacto inicial.
- Guardar contexto de consulta.
- Abrir y mantener un tratamiento activo.
- Registrar visitas/encuentros.
- Consultar historial básico del caso.

### Fuera de alcance de V1

- Agenda.
- Pagos.
- Self-booking / autogestión de turnos.
- `/portal`.
- Multiusuario.
- Auth compleja.
- Panel administrativo amplio o de propósito general.

## 4) V2 — consolidación operativa de la app clínica privada

V2 se define como fase de consolidación operativa sobre el flujo clínico ya establecido en V1.

### Incluye conceptualmente

- Consolidación de rutas privadas bajo `/admin/...`.
- Auth mínima para uso en producción.
- Navegación operativa más firme para el flujo profesional.
- Endurecimiento de detalles y listados principales.
- Mejor consistencia operativa entre pacientes, tratamiento activo y visitas.

### Nota de alcance

En esta fase la app privada debe considerarse operativamente protegida.

No se detallan aquí decisiones técnicas exhaustivas de auth, arquitectura ni implementación interna; eso corresponde al documento técnico específico.

## 5) V3 o posterior (evolución futura)

Posibles líneas de evolución posterior, sujetas a validación de uso real:

- `/portal`.
- Auth más robusta.
- Capacidades para paciente/familiar.
- Agenda, solo si la necesidad operativa real lo justifica.

## 6) Orden recomendado de implementación

1. Alta inicial (patient intake) y contacto principal.
2. Detalle de paciente y contexto inicial.
3. Tratamiento activo (EpisodeOfCare).
4. Registro de visitas/encuentros.
5. Historial básico.
6. Consolidación operativa privada y auth mínima.

## 7) Criterio de cierre por fase

### Cierre de V1

V1 puede considerarse cerrada cuando exista un flujo mínimo útil del profesional que permita:

- Alta de paciente.
- Registro de contexto inicial.
- Apertura/seguimiento de tratamiento activo.
- Registro de visita.
- Consulta de historial básico.
- Todo dentro de una superficie privada coherente para uso profesional.

### Cierre de V2

V2 puede considerarse cerrada cuando:

- La superficie privada esté operativamente protegida.
- La navegación operativa base esté consolidada.
- El uso profesional básico sea estable en la práctica.

## Relación con otros documentos

Este plan no reemplaza la fuente de verdad operativa ni el documento de decisiones de dirección.

Debe mantenerse alineado con:

- `docs/fuente-de-verdad-operativa.md`
- `docs/decisiones-evolucion-app-clinica.md`
- `.github/copilot-instructions.md`
