# FHIR-021 — Cierre de mapping transicional `ServiceRequest.status/statusReason`

> Estado: cerrado documentalmente (aprobado para habilitar FHIR-023)
> Fecha: 2026-04-28
> Alcance: decisión transicional previa a implementación runtime de `ServiceRequest`.

> Aclaración de alcance: este documento cerró decisión de mapping previa a implementación. El mapping definido aquí hoy se encuentra aplicado en runtime (mappers/repository) y usado por la UI administrativa de resolución de solicitudes en `/admin/patients/[id]/administrative`.

## 1) Objetivo

Cerrar el mapping transicional de estados de solicitud (`ServiceRequest.status`) y del motivo de cierre (`ServiceRequest.statusReason`) para evitar ambigüedad semántica antes de FHIR-023.

## 2) Decisión de mapping de estados

Estados conceptuales de dominio:

- `in_review`
- `accepted`
- `closed_without_treatment`
- `cancelled`
- `entered_in_error`

Mapping FHIR R4 aprobado:

| Dominio | `ServiceRequest.status` | Decisión | Justificación operativa |
| --- | --- | --- | --- |
| `in_review` | `active` | ✅ Cerrado | Solicitud vigente en evaluación. `draft` se reserva para borrador interno no publicado. |
| `accepted` | `active` | ✅ Cerrado | Solicitud vigente; puede estar pendiente de episodio o vinculada a un `EpisodeOfCare`. |
| `closed_without_treatment` | `revoked` | ✅ Cerrado | Expresa que la solicitud no seguirá su curso. Evita confusión con “flujo completado” o con cierre de tratamiento. |
| `cancelled` | `revoked` | ✅ Cerrado | Semánticamente consistente: solicitud anulada/no continuará. |
| `entered_in_error` | `entered-in-error` | ✅ Cerrado | Uso estándar FHIR para error administrativo/documental. |

### 2.1) Nota semántica clave

Se adopta **`closed_without_treatment` → `revoked`** (y no `completed`) para preservar separación entre:

- estado de solicitud (`ServiceRequest.status`);
- estado de tratamiento (`EpisodeOfCare.status`).

Así se minimiza la lectura errónea de “completado” como si hubiera existido tratamiento clínico finalizado.

## 3) Uso de `statusReason` para cierre sin tratamiento

Convención aprobada:

- Cuando `ServiceRequest.status = revoked` por cierre sin tratamiento o cancelación, registrar motivo en `ServiceRequest.statusReason.text`.
- `closedReason` técnico puede mantenerse en dominio/read-model.
- `closedReasonText` se mapea a `statusReason.text`.

Ejemplo conceptual:

```json
{
  "resourceType": "ServiceRequest",
  "status": "revoked",
  "statusReason": {
    "text": "No requiere tratamiento en este momento"
  }
}
```

Fallback transicional:

- Si un servidor/perfil no aceptara `statusReason`, usar `note.text` etiquetada (ej: `closed-reason:`) como mecanismo documental transitorio.

### 3.1) Nota técnica de desambiguación `accepted` vs `in_review` (runtime actual)

Como ambos estados de dominio (`accepted` e `in_review`) mapean a FHIR `active`, el runtime aplica una convención técnica de lectura/escritura en `note` para preservar fidelidad de estado:

- `workflow-status:v1:accepted` => interpretar `active` como `accepted`;
- `active` sin marca (o marca desconocida) => interpretar como `in_review`.

Estado al 2026-04-28: esta convención sigue **vigente** y queda **probada** por tests de mapper (roundtrip, no-duplicación de workflow tag, limpieza al cerrar/cancelar y preservación de notas no relacionadas).

## 4) Representación de “No inició” sin copy duro

Decisión de copy-operativa para read-model/UI futura (sin cambios de UI en esta tarea):

- Estado técnico de dominio: `closed_without_treatment`.
- Label recomendado en UI: **“No inició”**.
- Copy de soporte: “La solicitud se cerró sin iniciar tratamiento.”

Guardrail:

- no exponer en UI labels duros como “Rechazada/Denegada” como etiqueta principal;
- mantener trazabilidad técnica del cierre vía `statusReason.text`.

## 5) Separación de estados preservada

Se confirma explícitamente:

- No persistir `PatientOperationalStatus` en FHIR.
- No persistir `episodeLinkStatus` literal en FHIR.
- `ServiceRequest.status` solo describe vida de la solicitud.
- `EpisodeOfCare.status` solo describe vida del tratamiento.

## 6) Relación con FHIR-020 y habilitación de FHIR-023

Este cierre queda alineado con FHIR-020:

- vínculo SR↔EoC viable con owner en `EpisodeOfCare.referralRequest`;
- búsqueda por vínculo usando `EpisodeOfCare?incoming-referral=...`.

Con FHIR-021 cerrado, FHIR-023 puede implementar mappers/tipos/repositorio sin ambigüedad en estado/motivo de cierre.

## 7) Fuera de alcance (preservado)

- Implementación runtime de `ServiceRequest`.
- Cambios en repositorios, schemas, rutas, UI.
- Persistencia de estados derivados de paciente en FHIR.
