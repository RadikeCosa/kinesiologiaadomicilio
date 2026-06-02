# FHIR-018 — Deuda explícita y trigger de evolución de `Patient.address`

> Estado: aprobado como cierre documental de Fase 3
> Fecha: 2026-04-23 (UTC)
> Alcance: **documentación** de deuda aceptada y triggers de evolución de `Patient.address` (sin cambios funcionales)

## 1) Estado actual aceptado

- El producto opera hoy con `Patient.address` simplificado en forma textual (`address.text`).
- Esta simplificación sigue siendo suficiente para el alcance operativo actual (captura/lectura administrativa sin lógica logística avanzada).
- La decisión se mantiene como transicional, explícita y consciente de deuda.

## 2) ¿Por qué `address.text` sigue siendo aceptable hoy?

Es aceptable en esta etapa porque:

1. cubre la necesidad vigente de registrar una referencia de dirección para operación administrativa básica;
2. evita abrir una complejidad de modelado postal/geográfico que hoy el producto no consume end-to-end;
3. preserva un flujo simple y estable mientras no haya requerimientos reales de geocodificación, ruteo o filtros geográficos avanzados.

## 3) Qué no resuelve esta simplificación

Queda explícito que `address.text` **no** resuelve bien:

- geocodificación confiable;
- filtros estructurados por localidad/zona;
- optimización logística/ruteo de visitas;
- interoperabilidad postal más rica (componentes estructurados de dirección).

## 4) Riesgos aceptados mientras se mantiene `address.text`

- mayor variabilidad de formato entre operadores;
- dificultad para explotar el dato con reglas geográficas precisas;
- costo de migración futura si aparece demanda de address estructurado.

Estos riesgos quedan aceptados mientras no aparezcan los triggers definidos abajo.

## 5) Triggers explícitos de evolución futura

Reabrir `Patient.address` para diseño/implementación estructurada si ocurre cualquiera de estos eventos:

1. se necesita geocodificación para operación real;
2. se requieren filtros por localidad, zona o cobertura geográfica operativa;
3. aparece lógica logística más fina para planificación/ruteo de visitas;
4. se incorpora integración con agenda/ruteo que consume componentes de dirección;
5. aparecen requerimientos de interoperabilidad postal más ricos que no se puedan cubrir con `address.text`.

## 6) Límites explícitos mientras no haya triggers

Mientras estos triggers no aparezcan, queda fuera de alcance:

- rediseñar `Address` completo en dominio/FHIR;
- incorporar validaciones postales avanzadas;
- modelar componentes estructurados (línea, ciudad, provincia, código postal, país) como requisito obligatorio;
- mezclar esta evolución con otros frentes no relacionados.

## 7) Cierre de Fase 3 en este frente

Con FHIR-013 a FHIR-018 cerrados, la Fase 3 queda cerrada en términos de remediación incremental planificada para `Patient`:

- `telecom`: contrato + implementación mínima;
- `contact.relationship`: contrato + implementación mínima de contacto principal;
- `name`: mejora incremental sin rediseño completo;
- `address`: deuda explícita y triggers de evolución documentados.
