# Auditoría técnica E2E — nota general del paciente (`notes`)

Fecha: 2026-04-19 (UTC)
Alcance: superficie privada clínica, flujo `Patient.note` / `notes`.

## A) Circuito actual de `notes` (create / update / read)

### CREATE
1. **UI (`/admin/patients/new`)**
   - El formulario captura `notes` desde `<textarea name="notes" />`.
   - Al submit, transforma `""` a `undefined` con `String(...) || undefined`.
2. **Action**
   - `createPatientAction` parsea con `createPatientSchema` y delega a `createPatient`.
3. **Schema**
   - `createPatientSchema` normaliza `notes` con trim y mantiene `undefined` si queda vacío.
4. **Write mapper**
   - `mapCreatePatientInputToFhir` usa `buildNotes` y mapea a `note: [{ text }]`.
5. **Repository**
   - `createPatient` hace `fhirClient.post("Patient", payload)`.
6. **Payload FHIR esperado**
   - `note` se envía como array de `Annotation` mínimo (`[{ text: string }]`).
7. **Respuesta FHIR y persistencia**
   - El repo devuelve `mapFhirPatientToDomain(created)` sobre la respuesta del POST.
   - No hay verificación adicional en runtime real de que un GET posterior conserve `note`.

### UPDATE
1. **UI edición (`PatientEditForm`)**
   - `<textarea name="notes" defaultValue={patient.patientNotes ?? ""} />`.
   - Submit también hace `String(...) || undefined`.
2. **Action (`updatePatientAction`)**
   - Parsea con `updatePatientSchema`.
   - Carga paciente existente (`getPatientById`) y arma `scopedInput`.
3. **Schema**
   - `updatePatientSchema` también trimmea `notes`.
4. **Write mapper + merge**
   - Estrategia: `GET existing` + `mapUpdatePatientInputToFhir({existing, update})` + `PUT`.
   - Si `update.notes === undefined`, preserva `existing.note`.
   - Si `update.notes` trae contenido, sobrescribe `note` con `[{ text: notes }]`.
5. **Riesgo de pisado/vaciado**
   - Si el usuario envía textarea vacío, llega `undefined`, entonces preserva `existing.note` (no borra).
   - Pero cualquier actualización con `notes` informado colapsa múltiples `note[*]` en un solo `note[0]` textual.

### READ / DETAIL
1. **Repository read**
   - `getPatientById` hace GET `Patient/{id}` y lo mapea con `mapFhirPatientToDomain`.
2. **Read mapper**
   - `extractPatientNotes` toma `patient.note[*].text`, filtra vacíos, concatena con `"\n\n"`.
3. **Read model**
   - `mapPatientToDetailReadModel` expone `patientNotes: patient.notes`.
4. **Render**
   - `PatientDetailView` renderiza `{patient.patientNotes ?? "Sin notas generales informadas."}`.

## B) Hallazgos confirmados

### Correcto (con evidencia)
- El circuito local **sí contempla** `notes` en create/update/read end-to-end a nivel código.
- Mapeo write create a `Patient.note` existe y está testeado unitariamente.
- Mapeo update preserva nota existente cuando `notes` no viaja y sobrescribe cuando sí viaja.
- Read mapper toma `Patient.note` y lo lleva al detail read model.

### Sospechoso
- Falta evidencia de integración real contra servidor FHIR para confirmar persistencia de `Patient.note` tras POST/PUT y luego GET.
- La respuesta del PUT en tests de repo no incluye `note`; por lo tanto no se valida roundtrip completo del campo.
- El test de `PatientDetailView` no cubre render con `patientNotes`, sólo dirección.

### Claramente roto
- Los tests de integración `tests/integration/admin-patients/*` fallan por dependencia a funciones `__reset...ForTests` inexistentes.
- Esto elimina una fuente clave de evidencia de comportamiento e2e interno en test-suite actual.

## C) Hipótesis ordenadas por probabilidad

1. **Combinación de bugs + falta de observabilidad de integración (más probable).**
   - El flujo local parece correcto en estático y unit tests, pero no hay evidencia confiable de roundtrip real.
2. **Comportamiento/limitación del servidor FHIR sobre `Patient.note`.**
   - Puede aceptar payload y omitir `note` al persistir/serializar retorno.
3. **Pérdida en lectura local (menos probable, pero posible en edge cases).**
   - Si FHIR devuelve `note` en formato inesperado o fuera del recurso leído, se perdería.
4. **Problema de render UI (menos probable como causa principal).**
   - Render existe; no hay pruebas de regresión para notas, pero el binding está.
5. **Bug sólo de create o sólo de update (aislado).**
   - Código actual no muestra ruptura aislada obvia; más plausible un problema de interacción externa o múltiples fallas.

## D) Próxima verificación mínima recomendada

1. **Instrumentar evidencia de payload/respuesta en runtime real (sin refactor):**
   - Log temporal (o inspección de red) del JSON exacto de POST/PUT Patient.
   - Confirmar presencia de `note` en request body.
2. **Roundtrip inmediato por ID:**
   - Tras create/update, ejecutar GET `Patient/{id}` y comparar `note` request vs `note` leído.
3. **Test de contrato de repositorio con doble GET/PUT/GET:**
   - Asegurar que si servidor devuelve `note`, el mapper lo preserva y detail lo renderiza.
4. **Agregar test de render de `PatientDetailView` con `patientNotes` multilinea.**

Fix mínimo si se confirma cada causa:
- Si FHIR descarta `Patient.note`: definir alternativa de almacenamiento (extensión/profile/otro recurso) o ajustar server profile.
- Si lectura local pierde dato: corregir mapper read.
- Si render falla: test + ajuste de componente (p.ej. `whitespace-pre-line` si se requiere respetar saltos).

## E) Archivos involucrados

- Formularios:
  - `src/app/admin/patients/new/components/PatientCreateForm.tsx`
  - `src/app/admin/patients/[id]/components/PatientEditForm.tsx`
- Actions:
  - `src/app/admin/patients/actions/create-patient.action.ts`
  - `src/app/admin/patients/[id]/actions/update-patient.action.ts`
- Schemas:
  - `src/domain/patient/patient.schemas.ts`
- Mappers:
  - `src/infrastructure/mappers/patient/patient-write.mapper.ts`
  - `src/infrastructure/mappers/patient/patient-read.mapper.ts`
  - (separado, otro concepto) `src/infrastructure/mappers/episode-of-care/episode-of-care-note.helpers.ts`
- Repository:
  - `src/infrastructure/repositories/patient.repository.ts`
- Read model / data / render:
  - `src/features/patients/read-models/patient-detail.read-model.ts`
  - `src/app/admin/patients/[id]/data.ts`
  - `src/app/admin/patients/[id]/components/PatientDetailView.tsx`
- Tests relevantes:
  - `src/infrastructure/mappers/patient/__tests__/patient-write.mapper.test.ts`
  - `src/infrastructure/mappers/patient/__tests__/patient-read.mapper.test.ts`
  - `src/infrastructure/repositories/__tests__/patient.repository.test.ts`
  - `src/app/admin/patients/actions/__tests__/create-patient.action.test.ts`
  - `src/app/admin/patients/[id]/actions/__tests__/update-patient.action.test.ts`
  - `src/app/admin/patients/[id]/components/__tests__/PatientDetailView.test.ts`
  - `tests/integration/admin-patients/test-setup.ts` (actualmente roto)

## F) Riesgos / límites del diagnóstico

- Sin evidencia de tráfico real al FHIR server (request/response de producción o staging), no se puede afirmar persistencia real de `Patient.note`.
- El estado actual de tests de integración impide validar e2e interno con confianza.
- Se distinguen explícitamente dos conceptos:
  - `Patient.note` = nota general del paciente.
  - `EpisodeOfCare.note` = descripción breve del tratamiento (no mezclar).
