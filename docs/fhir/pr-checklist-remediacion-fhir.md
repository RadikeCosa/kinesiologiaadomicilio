# PR Checklist — remediación FHIR

> Uso obligatorio en PRs del backlog FHIR

## 1. Trazabilidad

- [ ] El PR referencia ticket FHIR-xxx.
- [ ] El alcance coincide con el ticket.
- [ ] No mezcla tickets sin justificación explícita.

## 2. Contrato y dominio

- [ ] El cambio actualiza contrato de dominio si corresponde.
- [ ] No introduce naming ambiguo.
- [ ] Mantiene backward compatibility cuando fue requerida.

## 3. Capa FHIR

- [ ] Los mappers read/write quedaron alineados.
- [ ] No se inventa semántica no soportada por producto.
- [ ] Cualquier simplificación nueva quedó explícitamente documentada.

## 4. UI / actions

- [ ] La UI refleja el contrato nuevo.
- [ ] Actions y validación quedaron consistentes.
- [ ] No quedaron campos “a medias” entre UI y persistencia.

## 5. Tests

- [ ] Hay cobertura de schema si aplica.
- [ ] Hay cobertura de mapper si aplica.
- [ ] Hay cobertura de integración si aplica.
- [ ] No se rompieron reglas operativas existentes sin decisión explícita.

## 6. Documentación

- [ ] Se actualizó `README.md` si corresponde.
- [ ] Se actualizó `docs/fuente-de-verdad-operativa.md` si corresponde.
- [ ] Se actualizó `docs/fhir/*` si el contrato o plan cambió.

## 7. Cierre del ticket

- [ ] El criterio de aceptación del ticket quedó cumplido.
- [ ] El criterio de no alcance se respetó.
- [ ] La deuda remanente quedó explicitada.
