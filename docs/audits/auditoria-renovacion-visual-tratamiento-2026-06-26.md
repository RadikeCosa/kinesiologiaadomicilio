# Auditoría de renovación visual de `/admin/patients/[id]/treatment`

## 1. Resumen ejecutivo

- Estado general: la superficie cumple bien su contrato funcional, pero visualmente sigue resolviendo casi todo como una secuencia vertical de bloques homogéneos, con jerarquía moderada y poco aprovechamiento del ancho disponible.
- Hallazgo principal confirmado: el contenido central de la pantalla no está organizado alrededor de un “panel de estado + contexto + acciones” claramente dominante. Hoy el usuario recorre:
  - cabecera;
  - mensajes;
  - formulario largo;
  - bloque de estado;
  - resumen de tratamiento finalizado;
  - cierre;
  - historial.
- Riesgo principal: la pantalla comunica correctamente el flujo, pero no prioriza suficientemente la lectura rápida del estado clínico-operativo ni la edición ocasional del contexto general del tratamiento.
- Recomendación principal: un patch posterior debería reorganizar `/treatment` como una pantalla de “estado actual del tratamiento” con:
  - un resumen superior más fuerte;
  - mejor separación entre contenido central y contenido secundario;
  - tratamiento activo y contexto general como núcleo visual;
  - historial y cierre en zonas visualmente subordinadas.

### Hallazgos confirmados en código

- Se basan en `page.tsx`, subcomponentes route-locales, superficies relacionadas y tests existentes.

### Inferencias UX

- Son lecturas de jerarquía, escaneabilidad, densidad visual y ergonomía de uso profesional.

### Recomendaciones

- No implican implementación todavía.

## 2. Mapa de archivos/componentes involucrados

| tipo | archivo | rol en la superficie |
|---|---|---|
| ruta principal | `src/app/admin/patients/[id]/treatment/page.tsx` | compone cabecera, estado, contexto, inicio, cierre e historial |
| formulario longitudinal | `src/app/admin/patients/[id]/components/TreatmentClinicalContextForm.tsx` | edición inline campo por campo del contexto general |
| inicio | `src/app/admin/patients/[id]/components/StartEpisodeOfCareForm.tsx` | inicio de tratamiento desde solicitud aceptada válida |
| cierre | `src/app/admin/patients/[id]/components/FinishEpisodeOfCareForm.tsx` | cierre formal del tratamiento activo |
| lectura clínica | `src/app/admin/patients/[id]/clinical-context.ts` | read model del contexto longitudinal |
| copy compartida | `src/app/admin/patients/[id]/patient-surface-copy.ts` | definiciones breves de tratamiento y gestión clínica |
| contexto relacionado | `src/app/admin/patients/[id]/encounters/components/ClinicalCycleContextCard.tsx` | resumen read-only del contexto longitudinal consumido en gestión clínica |
| superficie relacionada | `src/app/admin/patients/[id]/page.tsx` | hub del paciente con layout a dos columnas y CTA principal/auxiliar mejor jerarquizados |
| superficie relacionada | `src/app/admin/patients/[id]/administrative/page.tsx` | referencia de layout simple y secciones operativas |
| superficie relacionada | `src/app/admin/patients/[id]/encounters/page.tsx` | referencia de cabecera compacta + CTA clínico + paneles resumen |
| tests | `src/app/admin/patients/[id]/treatment/__tests__/page.test.ts` | cubre CTA, copy de estado y orden general |
| tests | `src/app/admin/patients/[id]/components/__tests__/TreatmentClinicalContextForm.test.ts` | cubre labels/helpers del contexto general |

## 3. Estado actual de la superficie

### Confirmado en código

- La ruta renderiza un `section` principal de ancho libre, sin `max-w-*`, con `rounded-xl border bg-white p-5 sm:p-6`.
- La cabecera contiene:
  - link de retorno;
  - título `Tratamiento · Contexto general del tratamiento`;
  - badge de estado;
  - un solo CTA visible a `Gestión clínica`;
  - subcopy y metadatos mínimos de paciente.
- Si llega `status=treatment-started`, aparece un mensaje de éxito.
- Si hay tratamiento activo:
  - aparece `TreatmentClinicalContextForm`;
  - aparece un bloque `Tratamiento activo`;
  - aparece el bloque colapsado de cierre;
  - puede coexistir historial debajo.
- Si no hay tratamiento activo:
  - aparece un bloque de estado vacío o finalizado;
  - puede aparecer `StartEpisodeOfCareForm` si hay solicitud válida;
  - puede aparecer resumen del último tratamiento finalizado;
  - puede aparecer historial de ciclos cerrados.
- `TreatmentClinicalContextForm` hoy renderiza cinco cards verticales homogéneas, cada una con:
  - título;
  - helper;
  - valor actual;
  - CTA de agregar/editar;
  - formulario inline local al abrir edición.

### Lectura UX

- La superficie ya comunica mejor el flujo que antes del patch mínimo.
- El problema restante no es semántico sino compositivo:
  - casi todos los bloques compiten con un peso visual parecido;
  - el estado del tratamiento no domina lo suficiente;
  - el contexto general queda “largo” más que “escaneable”.

## 4. Problemas visuales y de UX detectados

### Hallazgos confirmados

- La pantalla está resuelta como stacking vertical casi completo.
- No hay una diferenciación espacial fuerte entre:
  - núcleo actual del tratamiento;
  - acciones secundarias;
  - historial;
  - cierre.
- El formulario longitudinal usa cinco cards consecutivas muy similares.
- El bloque `Tratamiento activo` es liviano en contenido, pero ocupa una banda visual completa.
- `Resumen del tratamiento finalizado` e `Historial de ciclos cerrados` pueden quedar visualmente pesados cuando no hay tratamiento activo.
- `FinishEpisodeOfCareForm` queda contenido dentro de `details`, lo que lo protege, pero también lo vuelve casi invisible salvo búsqueda explícita.

### Inferencias UX

- La pantalla se siente más como una página de “formularios y bloques” que como una pantalla de “estado clínico-operativo del tratamiento”.
- La lectura rápida exige scroll e interpretación secuencial, no una comprensión a primera vista.
- En desktop, el usuario pierde oportunidad de escanear estado, acciones y contexto en paralelo.

## 5. Problemas de jerarquía de información

### Qué se ve primero hoy

- título + badge;
- CTA a gestión clínica;
- subtítulo;
- eventualmente mensaje de éxito;
- luego directamente formulario o bloque de estado.

### Qué debería verse primero

- estado del tratamiento;
- acción disponible más relevante;
- resumen corto del contexto general si existe;
- después edición detallada y antecedentes.

### Confirmado en código

- El bloque más largo y visualmente dominante del estado activo es el formulario `TreatmentClinicalContextForm`.
- El resumen de estado activo es textual y breve.
- El contenido de cierre e historial aparece después, pero sin gran reducción de peso visual.

### Inferencias UX

- Sobredimensionado:
  - la repetición de cards editables homogéneas del contexto general.
- Escondido o demasiado abajo:
  - una síntesis rápida del tratamiento activo;
  - la diferencia entre contenido “actual” y contenido “histórico”;
  - el carácter secundario del cierre.

## 6. Problemas de aprovechamiento de espacio

### Confirmado en código

- A diferencia del hub del paciente, `/treatment` no usa `max-w-5xl` ni un grid explícito a dos columnas.
- `TreatmentClinicalContextForm` apila cinco cards una debajo de otra incluso en desktop.
- Los bloques de estado, resumen final e historial ocupan el ancho completo y se apilan.

### Inferencias UX

- Desktop queda subaprovechado:
  - mucho scroll;
  - poca lectura lateral;
  - baja densidad útil por pantalla.
- Mobile no está roto desde el código; el diseño vertical probablemente funciona aceptablemente.
- El mayor margen de mejora está en desktop/tablet grande, no en mobile.

## 7. Propuesta de layout renovado

### Objetivo

- Mantener la pantalla como superficie de tratamiento, no como dashboard clínico amplio.
- Reorganizar visualmente sin pedir nuevos datos.

### Propuesta recomendada

- Estructura general en tres bandas:
  1. Cabecera compacta con identidad, badge y CTA principal.
  2. Zona central en dos columnas en desktop.
  3. Zona inferior secundaria para historial y cierre.

### Distribución sugerida

- Columna principal:
  - panel de estado actual del tratamiento;
  - panel de contexto general del tratamiento;
  - edición inline o expandible de los campos.
- Columna secundaria:
  - acciones contextuales;
  - inicio de tratamiento si corresponde;
  - atajos a gestión administrativa o solicitudes;
  - resumen corto del último tratamiento finalizado si no hay activo.

### Variante responsive

- Mobile:
  - mantener stacking vertical.
- Desktop:
  - usar grid tipo `minmax(0, 1.7fr) / minmax(280px, 1fr)` o similar, alineado con el patrón ya usado en el hub.

## 8. Propuesta de jerarquía de bloques

### Orden recomendado con tratamiento activo

1. Resumen del tratamiento activo.
2. Contexto general del tratamiento.
3. Edición del contexto.
4. Cierre del tratamiento.
5. Historial de ciclos cerrados.

### Orden recomendado sin tratamiento activo

1. Estado vacío / estado finalizado.
2. Inicio de tratamiento o derivación a solicitudes.
3. Resumen del último tratamiento finalizado.
4. Historial de ciclos cerrados.

### Regla visual

- Lo actual debe vivir arriba.
- Lo editable debe seguir a lo actual.
- Lo irreversible o sensible debe verse más abajo y con tratamiento visual de cautela.
- Lo histórico debe ser compacto y no competir con el presente.

## 9. Propuesta de jerarquía de acciones

### Tratamiento activo

- Acción principal:
  - `Ir a gestión clínica`
- Acción secundaria:
  - ninguna otra primaria al mismo nivel
- Acción terciaria:
  - editar campos del contexto general
- Acción sensible:
  - `Cerrar tratamiento`

### Sin tratamiento activo con solicitud válida

- Acción principal:
  - `Iniciar tratamiento`
- Acción secundaria:
  - `Volver a solicitudes`

### Sin tratamiento activo sin solicitud válida

- Acción principal:
  - `Ir a solicitudes`
- Acción secundaria:
  - `Ver gestión administrativa`

### Tratamiento finalizado

- Acción principal:
  - `Gestión administrativa para nuevo ciclo`
- Acción secundaria:
  - revisar historial

## 10. Propuesta de tratamiento visual por bloque

### 10.1 Estado del tratamiento

- Convertir el estado actual en un panel resumen visible y dominante.
- Contenido sugerido usando datos ya disponibles:
  - badge fuerte;
  - fecha de inicio o cierre;
  - una frase operativa;
  - CTA principal.
- Tratamiento visual:
  - borde y fondo diferenciados por estado;
  - tipografía un poco más fuerte;
  - agrupación horizontal en desktop.

### 10.2 Contexto general del tratamiento

- Separar lectura y edición.
- Recomendación:
  - arriba, una lectura resumida más escaneable;
  - abajo, edición por bloques o edición expandible.

### 10.3 Inicio de tratamiento

- Debe sentirse como panel de acción contextual, no como bloque perdido entre otros.
- Cuando haya solicitud aceptada válida:
  - ubicarlo en la columna secundaria o inmediatamente debajo del panel de estado.

### 10.4 Cierre

- Mantenerlo secundario y seguro.
- Recomendación:
  - seguir evitando que se vea como CTA principal;
  - en vez de confiar solo en `details`, considerar un bloque secundario visible con estilo de cautela y formulario colapsable interno.

### 10.5 Historial

- Volverlo más compacto que el ciclo activo.
- Mejor formato sugerido:
  - lista compacta tipo timeline/resumen;
  - no cards con peso similar al presente.

## 11. Propuesta específica para el contexto general del tratamiento

### Hallazgos confirmados

- Los cinco campos actuales están repartidos en cards iguales.
- Cada card combina lectura, helper y edición.

### Evaluación UX

- Bueno:
  - edición puntual;
  - claridad por campo;
  - helpers clínicos útiles.
- Mejorable:
  - la lectura rápida del conjunto;
  - el peso relativo entre diagnóstico, situación inicial, objetivos y plan;
  - la percepción de “síntesis clínica” frente a “detalle editable”.

### Propuesta

- Subdividir visualmente en tres grupos semánticos:
  - referencia inicial:
    - `Diagnóstico médico de referencia`
    - `Diagnóstico kinésico actual`
    - `Situación funcional al inicio`
  - dirección terapéutica:
    - `Objetivos del tratamiento`
    - `Plan general del tratamiento`
  - acción:
    - editar/agregar por campo o editar grupo

### Recomendación de protagonismo

- Mayor protagonismo visual:
  - `Diagnóstico kinésico actual`
  - `Situación funcional al inicio`
  - `Objetivos del tratamiento`
- Menor protagonismo relativo:
  - `Diagnóstico médico de referencia`
  - `Plan general del tratamiento`

## 12. Propuesta de wording si corresponde

### Confirmado

- El wording actual ya está bastante alineado con producto.

### Ajustes potenciales solo si ayudan a la escaneabilidad

- Cabecera:
  - mantener `Tratamiento`
  - bajar `Contexto general del tratamiento` como subtítulo o label de sección, no necesariamente dentro del título principal
- Estado activo:
  - `Tratamiento activo`
  - `Ya podés registrar visitas desde Gestión clínica.`
- Estado sin tratamiento:
  - mantener el gate explícito actual
- Historial:
  - `Ciclos anteriores`
  - o `Historial de tratamientos`
- Cierre:
  - `Cerrar tratamiento`
  - subtítulo: `Acción de cierre formal del ciclo`

## 13. Alternativas

### A. Patch mínimo

- Ajustar solo composición visual dentro del mismo flujo vertical.
- Cambios:
  - reforzar panel de estado;
  - compactar historial;
  - atenuar cierre;
  - agrupar mejor cards del contexto.
- Ventaja:
  - muy bajo riesgo.
- Desventaja:
  - mejora parcial del aprovechamiento de espacio.

### B. Patch intermedio

- Reorganizar la página a dos columnas en desktop.
- Cambios:
  - columna principal para estado + contexto;
  - columna secundaria para acciones contextuales;
  - historial y cierre debajo.
- Ventaja:
  - mejor balance entre claridad y patch incremental.
- Desventaja:
  - requiere más ajuste de tests y maquetado.

### C. Rediseño más ambicioso

- Introducir una verdadera capa de “lectura rápida + edición expandida” para el contexto general.
- Cambios:
  - resumen clínico arriba;
  - edición por acordeones o modo expandido;
  - historial más tipo timeline.
- Ventaja:
  - mejor experiencia final.
- Desventaja:
  - más riesgo de sobre-diseñar una superficie todavía pequeña.

## 14. Recomendación final de qué implementar primero

- Recomendación: `patch intermedio`.

### Motivo

- Es el mejor punto medio entre:
  - claridad clínica-operativa;
  - mejor uso del espacio en desktop;
  - respeto del producto mínimo;
  - bajo riesgo técnico.

### Qué incluiría primero

1. Reorganización a dos columnas en desktop.
2. Panel de estado del tratamiento más dominante.
3. Contexto general agrupado semánticamente.
4. Historial más compacto.
5. Cierre visualmente secundario pero más explícito.

## 15. Tests que habría que actualizar o agregar

- `src/app/admin/patients/[id]/treatment/__tests__/page.test.ts`
  - orden relativo de bloques si cambia la composición.
- `src/app/admin/patients/[id]/components/__tests__/TreatmentClinicalContextForm.test.ts`
  - si cambia el agrupamiento visible o labels secundarios.
- Nuevos tests recomendados:
  - existencia de layout a dos columnas solo como estructura CSS si se quiere blindar clases clave;
  - presencia del panel de estado antes del formulario;
  - historial subordinado al ciclo activo.

## 16. Documentación que podría requerir actualización

- `docs/fuente-de-verdad-operativa.md`
  - solo si cambia significativamente la forma visible de describir `/treatment`.
- `docs/checklist-sincronizacion-doc-codigo.md`
  - usar como control, no necesita cambio por sí mismo.
- `README.md`
  - no debería requerir actualización.

## 17. Riesgos de sobre-diseñar

- Convertir `/treatment` en una pseudo-historia clínica amplia.
- Introducir demasiadas capas de resumen, tabs o widgets.
- Forzar componentes globales nuevos sin reutilización real.
- Hacer que el historial o el cierre ganen demasiado peso visual.
- Construir un “dashboard” donde el producto necesita una pantalla operativa clara y sobria.

## 18. Fuera de alcance

- Cambios en dominio, FHIR, repositorios, mappers, schemas o reglas.
- Nuevas queries salvo necesidad claramente demostrada.
- Nuevas rutas o mezcla de responsabilidades entre superficies.
- Dashboard clínico amplio.
- Features futuras o claims de producto no implementados.

## 19. Conclusión

La superficie `/admin/patients/[id]/treatment` ya está bien orientada en contenido, pero todavía no está resuelta con la mejor composición posible para lectura rápida profesional. La mejora más valiosa no sería agregar más datos ni más lógica, sino ordenar mejor lo que ya existe:

- estado arriba;
- contexto actual como núcleo;
- acciones al costado;
- cierre con cautela;
- historial compacto y claramente secundario.

Eso permitiría que la pantalla se sienta más clara, moderna y útil sin dejar de ser una superficie privada mínima de tratamiento.
