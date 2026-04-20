# Checklist de sincronización doc-código (obligatorio por merge)

> Estado: vigente
> Última actualización: 2026-04-20 (UTC)

## Objetivo

Evitar desalineaciones entre documentación funcional/técnica y estado real del repositorio.

Este checklist se ejecuta en **cada merge** que cambie comportamiento de producto, rutas, reglas de negocio o tests.

## Checklist obligatorio

### 1) Rutas
- [ ] ¿Se agregó/eliminó/modificó alguna ruta pública o privada?
- [ ] Si cambió, ¿está actualizado en:
  - [ ] `README.md`
  - [ ] `docs/fuente-de-verdad-operativa.md`
  - [ ] documento de slice correspondiente.

### 2) Alcance del slice
- [ ] ¿Qué capacidad funcional exacta se implementó?
- [ ] ¿Está documentado con el mismo naming de código (rutas, actions, componentes, dominio)?
- [ ] ¿Quedó explícito qué sigue fuera de alcance?

### 3) Fuera de alcance (scope guard)
- [ ] ¿Se validó que no hubo expansión accidental de alcance?
- [ ] ¿Quedó explicitado en el documento del slice qué se **acepta como deuda**?
- [ ] ¿Se mantuvo coherencia con límites vigentes (`Observation`/`Procedure`, auth productiva, agenda, pagos, `/portal`, multiusuario)?

### 4) Tests y validación
- [ ] ¿Se actualizaron/agregaron tests mínimos del slice (unit + integration)?
- [ ] ¿Se registró resultado de checks locales (`lint`, `test`, y `build` cuando aplique)?
- [ ] ¿Los criterios de cierre del slice son verificables por código + tests?

### 5) Fecha de última actualización
- [ ] ¿Los documentos tocados tienen fecha real de actualización en UTC?
- [ ] ¿Las fechas son consistentes entre documentos relacionados?

## Documentos mínimos a revisar por merge

1. `README.md`
2. `docs/fuente-de-verdad-operativa.md`
3. Documento del slice en curso (ej. `docs/slice-3/...`)
4. Documento de plan funcional (`docs/plan-v1-v2-app-clinica.md`) solo si cambia alcance de fase.

## Regla de corte

Si cualquier ítem obligatorio queda en `no`, el merge se considera **incompleto** hasta corregir documentación o código.
