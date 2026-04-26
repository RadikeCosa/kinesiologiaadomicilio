# Auditoría UX/UI y funcional acotada — CTA “Registrar visita”

> Fecha: 2026-04-25 (UTC)
> 
> Alcance: superficies privadas de pacientes bajo `/admin`.

## 1) Findings

### 1.1 `/admin/patients`

- **Estado actual**: el CTA `Registrar visita` **sí existe** en cada card del listado.
- **Condición de render**: se muestra solo cuando `patient.operationalStatus === "active_treatment"`.
- **Destino**: `href="/admin/patients/[id]/encounters/new"`.
- **Jerarquía visual**: botón secundario (borde + fondo blanco + texto pequeño), consistente con la expectativa de no competir con el nombre del paciente ni con `Nuevo paciente`.
- **Consistencia con FdV operativa**: alineado con la convención vigente.

### 1.2 `/admin/patients/[id]`

- **Estado actual**: el CTA `Registrar visita` **no existe** en el hub del paciente.
- **Acciones presentes hoy**: solo `Gestión Clínica` y `Gestión Administrativa` con primaria dinámica según estado.
- **Impacto UX**: hay una brecha de descubribilidad para la acción clínica rápida, porque desde el hub hay un paso extra obligatorio (`Gestión Clínica` → `Registrar visita`).
- **Inconsistencia con criterio deseado**: falta acción contextual directa en la superficie central del paciente.

### 1.3 `/admin/patients/[id]/encounters`

- **Estado actual**: la pantalla sí expone un bloque de alta con título `Registrar visita`.
- **Condición de render**:
  - con tratamiento activo: muestra botón primario `Registrar visita` hacia `/encounters/new`;
  - sin tratamiento activo: reemplaza por CTA hacia `/treatment` y mensaje impeditivo.
- **Destino**: cuando existe CTA de alta, apunta correctamente a `/admin/patients/[id]/encounters/new`.
- **Jerarquía visual**: operativa/primaria dentro de una pantalla dedicada a visitas; alineado con el criterio deseado.
- **Observación de consistencia visual**: además del bloque de alta, hay un bloque previo de contexto de tratamiento que también contiene link a `Ir a gestión de tratamiento`; no rompe reglas, pero introduce cierta redundancia de navegación secundaria.

### 1.4 Gate real de negocio

- El gate de negocio para registrar visita **sigue correctamente en**:
  1. la superficie `/admin/patients/[id]/encounters/new` (render/form con `activeEpisodeId`), y
  2. la server action `createEncounterAction` (valida episodio activo + coincidencia de episodio antes de persistir).
- Esto protege contra bypass por URL o estado desactualizado de UI.

---

## 2) Recomendación concreta

## Convención final propuesta para las 3 superficies

1. **Destino único y estable**: todo CTA “Registrar visita” debe navegar a `/admin/patients/[id]/encounters/new`.
2. **Render condicional**:
   - mostrar CTA directo solo con tratamiento activo;
   - sin tratamiento activo, mantener convención existente de acción alternativa hacia tratamiento + mensaje impeditivo explícito en superficies clínicas.
3. **Jerarquía por superficie**:
   - `/admin/patients`: CTA secundario (mantener);
   - `/admin/patients/[id]`: agregar CTA como acción contextual clínica rápida (secundario/operativo, dentro de bloque de acciones);
   - `/admin/patients/[id]/encounters`: CTA principal/operativo (mantener).
4. **No duplicación innecesaria**:
   - en `/encounters` evitar repetir múltiples veces la misma salida secundaria a `/treatment` cuando no aporte decisión adicional (puede simplificarse a un único punto de salida por estado sin tratamiento, si se decide ajustar en una iteración posterior).
5. **Accesibilidad base**:
   - mantener texto visible `Registrar visita`;
   - mantener `href` explícito correcto;
   - no depender de iconografía sola.

## Qué no debe cambiarse

- No mover ni relajar el gate real de registro de visita en `/encounters/new` y `createEncounterAction`.
- No introducir rutas nuevas.
- No tocar FHIR, repositorios, mappers ni schemas, salvo inconsistencia funcional real (no detectada en este alcance).
- Mantener el lenguaje de producto (“visita”, “tratamiento”, “paciente”).

---

## 3) Plan de cambios mínimo

## Archivos a modificar

1. `src/app/admin/patients/[id]/page.tsx`
   - Agregar CTA contextual `Registrar visita` en el bloque de acciones del hub.
   - Condicionar render a tratamiento activo (`activeEpisode` o status operativo equivalente ya consolidado por la pantalla).
   - Destino: `/admin/patients/[id]/encounters/new`.
   - Mantener consistencia visual con botones ya existentes del header de acciones.

2. `src/app/admin/patients/[id]/__tests__/page.test.ts`
   - Agregar casos para validar:
     - presencia del CTA con tratamiento activo;
     - ausencia del CTA sin tratamiento activo;
     - `href` correcto.

## Opcional recomendado (si se busca cerrar redundancia detectada)

3. `src/app/admin/patients/[id]/encounters/page.tsx`
   - Revisar si conviene dejar un único acceso secundario a `/treatment` cuando no hay tratamiento activo (sin tocar el CTA primario de `Registrar visita` en estado activo).

4. `src/app/admin/patients/[id]/encounters/__tests__/page.test.ts`
   - Ajustar expectativas si se simplifica la duplicidad de links a tratamiento.

---

## 4) Riesgos / límites

- **FHIR**: fuera de alcance en este plan; no se requiere tocar integración FHIR.
- **Gate operativo**: debe permanecer en `/encounters/new` y server action (confirmado).
- **Rutas**: no se agregan rutas nuevas; solo se refuerza discoverability desde superficies existentes.
- **Riesgo UX menor**: agregar CTA en hub puede aumentar densidad de acciones en header; mitigable manteniendo estilo secundario y ubicación coherente con “Acciones contextuales”.

---

## 5) Validación sugerida

- `npm run lint`
- `npm run test`
- Tests específicos recomendados:
  - `src/app/admin/patients/[id]/__tests__/page.test.ts`
  - `src/app/admin/patients/[id]/encounters/__tests__/page.test.ts` (solo si se ajusta redundancia visual)

---

## 6) Estado de implementación (2026-04-25)

- Se agregó `Registrar visita` en `/admin/patients/[id]` como acción contextual secundaria, visible solo con tratamiento activo.
- En `/admin/patients/[id]/encounters` se realizó una segunda iteración UX/UI:
  - `Registrar visita` vive en el header interno, alineado a la derecha del nombre del paciente y se renderiza solo con tratamiento activo;
  - se eliminó la card separada de “Registrar visita”;
  - el contexto de tratamiento pasó a metadata compacta (estado + fecha relevante) debajo del subtítulo;
  - sin tratamiento activo se mantiene mensaje impeditivo claro con salida compacta a tratamiento.
- El gate real no se movió: permanece en `/encounters/new` y en `createEncounterAction`.
