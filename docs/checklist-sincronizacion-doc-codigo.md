# Checklist de sincronización documentación/código

> Estado: vigente
> Alcance: control liviano antes de merge cuando cambia código, UI, rutas, dominio, FHIR o comportamiento operativo.

## 1) Cuándo usar este checklist

Usar este checklist cuando un cambio toque alguno de estos frentes:

- rutas públicas o privadas;
- comportamiento UI visible;
- dominio/schemas/rules;
- mappers/repositorios FHIR;
- loaders/actions;
- estados operativos;
- documentación principal;
- decisiones FHIR/producto.

## 2) Preguntas mínimas

- [ ] ¿El `README.md` sigue describiendo correctamente el estado implementado?
- [ ] ¿`docs/fuente-de-verdad-operativa.md` sigue alineada con el comportamiento real?
- [ ] ¿`docs/fhir/README.md` requiere actualización?
- [ ] ¿`docs/normalization-data/README.md` requiere actualización?
- [ ] ¿`docs/product/README.md` o algún documento de producto activo requiere actualización?
- [ ] ¿Hay documentación histórica que debería salir del remoto y quedar solo como material local?
- [ ] ¿Se agregaron rutas nuevas que deban documentarse?
- [ ] ¿Se cambió un estado operativo, badge, CTA o gate?
- [ ] ¿Se cambió un contrato de dominio o mapper?
- [ ] ¿Los tests cubren el comportamiento nuevo o modificado?
- [ ] ¿Hay referencias rotas o nombres de archivo viejos?
- [ ] ¿`docs/archive/README.md` sigue reflejando el archivo real?
- [ ] Si el cambio resuelve hallazgos de una auditoría reciente, ¿esa auditoría sigue vigente o debe marcarse como supersedida, archivarse o referenciarse desde una auditoría posterior?

## 3) Regla de alcance

- No todos los cambios requieren tocar todos los documentos.
- La documentación principal debe reflejar solo comportamiento vigente.
- Documentos de producto/FHIR activos deberían priorizar contratos vigentes o dirección todavía útil para desarrollo.
- Auditorías o cierres históricos que ya no sean fuente activa deberían dejar de compartirse en el remoto.
- Si un patch deja una auditoría reciente desactualizada, conviene ordenarla en el mismo movimiento documental y no postergarlo.

## 4) Resultado esperado

Antes de merge, dejar asentado:

- qué documentos se actualizaron;
- qué documentos se revisaron y no requirieron cambios;
- qué quedó deliberadamente fuera de alcance.
