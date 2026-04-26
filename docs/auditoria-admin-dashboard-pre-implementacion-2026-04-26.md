# Auditoría técnica + UX de `/admin` previa a implementación

> Fecha: 2026-04-26 (UTC)
>
> Nota de cierre (2026-04-26): la Fase 1 del dashboard `/admin` quedó implementada y cerrada como aprobada; esta auditoría se conserva como insumo previo. Las observaciones no bloqueantes de cobertura de render se atendieron parcialmente con un micro-patch no funcional en tests de `/admin`.

## Objetivo
Definir una primera iteración para evolucionar `/admin` hacia dashboard operativo mínimo, sin romper la arquitectura vigente (Repository/Mapper/Domain/Route loader/UI), evitando lógica duplicada y evitando FHIR crudo en componentes visuales.

## Hallazgos clave
- `/admin` calcula métricas directamente en el componente de página a partir de `loadPatientsList()`. Conviene mover ese cálculo a un loader dedicado de dashboard.
- `loadPatientsList()` hoy introduce N+1 de `EpisodeOfCare` por paciente (1 o 2 búsquedas por paciente).
- No existe método de repositorio para conteo/listado global de `Encounter`; para métricas globales de visitas, hoy el costo es alto (N+1 por paciente).
- El cálculo de edad existe y está testeado en helper (`calculateAgeFromBirthDate`), reutilizable para agregados de edad.
- La UI privada ya evita exponer FHIR crudo en rutas principales gracias al uso de repositorios + mappers + read models.

## Propuesta de Fase 1
1. Crear loader específico de dashboard (`src/app/admin/data.ts`) que entregue un `AdminDashboardReadModel`.
2. Mantener cálculos fuera del JSX y encapsularlos en funciones puras (`src/app/admin/dashboard-metrics.ts`).
3. Reutilizar `loadPatientsList()` para métricas de pacientes/edad en Fase 1.
4. Posponer métricas globales de visitas o marcarlas como costo alto hasta contar con método de repositorio dedicado.

## Métricas sugeridas para Fase 1
- Incluir ahora (bajo costo):
  - pacientes totales;
  - con tratamiento activo/finalizado/sin tratamiento iniciado;
  - edad mínima/máxima/promedio sobre pacientes con `birthDate` válido;
  - cobertura de `birthDate` (con/sin).
- Incluir condicional o diferir (alto costo):
  - visitas registradas globales;
  - visitas recientes globales.

## UX de `/admin` (sin gráficos)
- Card 1: **Resumen operativo**
- Card 2: **Edad de pacientes**
- Nota explícita: “La edad se calcula solo sobre pacientes con fecha de nacimiento válida (`birthDate`).”
- Mantener CTA principal: `Ver pacientes`; CTA secundaria: `Nuevo paciente`.

## Tests recomendados
- Unit: agregadores puros de métricas (estado y edad).
- Loader: contrato de `AdminDashboardReadModel` con mocks de loader/repository.
- Render: `/admin/page.tsx` con estados normal y vacío.

## Documentación a actualizar en la implementación
- `README.md`: ampliar descripción de `/admin` como dashboard operativo mínimo.
- `docs/fuente-de-verdad-operativa.md`: reflejar nuevas cards/métricas y aclaraciones de cobertura `birthDate`.

## Fuera de alcance de esta iteración
- Persistir métricas derivadas.
- Gráficos y tendencias temporales avanzadas.
- Cambios de persistencia FHIR.
- Nuevas rutas.
