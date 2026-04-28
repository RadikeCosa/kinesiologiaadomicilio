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
- [ ] ¿`docs/fhir/README.md` o documentos FHIR específicos requieren actualización?
- [ ] ¿`docs/product/*` (o `docs/producto/*` si existiera) requiere actualización si cambió una hipótesis o decisión de producto?
- [ ] ¿Hay documentación histórica que debería moverse a `docs/archive`?
- [ ] ¿Se agregaron rutas nuevas que deban documentarse?
- [ ] ¿Se cambió un estado operativo, badge, CTA o gate?
- [ ] ¿Se cambió un contrato de dominio o mapper?
- [ ] ¿Los tests cubren el comportamiento nuevo o modificado?
- [ ] ¿Hay referencias rotas o nombres de archivo viejos?

## 3) Regla de alcance

- No todos los cambios requieren tocar todos los documentos.
- La documentación principal debe reflejar solo comportamiento vigente.
- Documentos de producto/FHIR pueden contener hipótesis futuras si están marcadas como tales.
- Auditorías/cierres históricos deben ir a `docs/archive` cuando ya no sean fuente activa.

## 4) Resultado esperado

Antes de merge, dejar asentado:

- qué documentos se actualizaron;
- qué documentos se revisaron y no requirieron cambios;
- qué quedó deliberadamente fuera de alcance.
