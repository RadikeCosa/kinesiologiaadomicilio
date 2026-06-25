# Practitioner — profesional firmante single-user

> Estado: base técnica implementada, sin UI productiva
> Fecha: 2026-06-02

## 1. Objetivo

Definir el contrato FHIR mínimo para representar el profesional firmante único de la instalación privada. Este dato prepara futuros reportes o documentos clínicos revisados, pero este patch no implementa UI, reportes ni firma clínica final.

## 2. Recurso

Se usa `Practitioner` R4.

No se usa en esta etapa:

- `PractitionerRole`;
- `Organization`;
- multiusuario;
- referencias desde `Encounter`, `Patient`, `EpisodeOfCare`, `Observation` o `Condition`.

## 3. Identificadores

### 3.1 Identificador singleton

El profesional firmante único se localiza por:

```txt
system: https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config
value: primary
```

Este identificador es técnico. No representa matrícula profesional y no debe mostrarse como dato clínico.

La búsqueda operativa es:

```txt
Practitioner?identifier=https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config|primary
```

### 3.2 Matrícula profesional

La matrícula se modela como identifier separado:

```txt
system: https://kinesiologiaadomicilio.local/fhir/sid/professional-license
value: <matricula>
type.text: Matricula profesional
```

La matrícula no debe confundirse con el identificador singleton.

## 4. Campos mapeados

| Dominio | FHIR |
|---|---|
| `id` | `Practitioner.id` |
| `fullName` | `Practitioner.name[0].text` |
| `roleTitle` | `Practitioner.qualification[0].code.text` |
| `licenseNumber` | `Practitioner.identifier` con system de matrícula |
| `licenseJurisdiction` | `Practitioner.qualification[0].issuer.display` |
| `signatureDisplay` | extensión local `practitioner-signature-display` |
| `professionalPhone` | `Practitioner.telecom` phone/work |

Extensión de display de firma:

```txt
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/practitioner-signature-display
```

## 5. Reglas de completitud

Estados de dominio:

- `missing`: no existe `Practitioner` con identificador singleton.
- `incomplete`: existe, pero falta `fullName`, `roleTitle` o `licenseNumber`.
- `ready`: existen `fullName`, `roleTitle` y `licenseNumber`.

`licenseJurisdiction`, `signatureDisplay` y `professionalPhone` son opcionales.

## 6. Preservación en updates

La escritura usa patrón `GET -> merge -> PUT`.

El mapper de update preserva:

- identifiers externos distintos del singleton y matrícula;
- extensions externas distintas del display de firma;
- telecom externo no manejado por la app;
- campos FHIR no propios siempre que sea razonable mediante merge sobre el recurso existente.

No se deben borrar datos externos en un `PUT` de configuración profesional.

## 7. Duplicados

Si la búsqueda por singleton devuelve más de un `Practitioner`, el repositorio debe:

- fallar con error de ambigüedad;
- no elegir silenciosamente;
- no crear ni actualizar recursos;
- requerir corrección manual o herramienta de mantenimiento futura.

## 8. Validación HAPI local

Validación ejecutada el 2026-06-02 contra `FHIR_BASE_URL=http://localhost:8080/fhir`:

- `GET /metadata`: HTTP 200, `CapabilityStatement`.
- `GET /Practitioner?identifier=https%3A%2F%2Fkinesiologiaadomicilio.local%2Ffhir%2Fsid%2Fsigning-practitioner-config%7Cprimary`: HTTP 200, `Bundle`, `total=0`.

Esto confirma que el servidor responde a `Practitioner` y acepta la búsqueda por `identifier`; no crea datos reales.
