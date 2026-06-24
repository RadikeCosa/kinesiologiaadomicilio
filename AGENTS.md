# AGENTS.md

## Purpose

This file tells coding agents how to work safely and accurately in this repository.

The project is a HealthTech case study built from a real home-care physiotherapy context in Neuquen, Argentina. It combines:

- a public patient acquisition site as the main active surface;
- a minimal private clinical workflow under `/admin`;
- local integration with HAPI FHIR R4 for private/admin flows.

Agents should preserve that framing in code, docs, and proposed changes.

## Product Narrative

Describe the repository as:

- a real-world healthcare workflow digitization project;
- a combined public + private application;
- a minimal and transitional clinical operations surface, not a full EHR;
- a case study relevant to HealthTech, Clinical Systems, Implementation, Product, and junior full-stack roles in healthcare.

Do not describe it as:

- only a landing page;
- a generic CRUD demo;
- a production-ready multi-user SaaS admin;
- a public admin demo unless a safe demo mode is actually implemented;
- a full clinical record platform.

## Current Scope

### Public surface

- `/`
- `/services`
- `/evaluar`

Public scope includes:

- SEO and metadata;
- WhatsApp CTAs and prefilled messages;
- GA4 on public routes only.

### Private clinical surface

- `/admin`
- `/admin/configuracion/profesional`
- `/admin/patients`
- `/admin/patients/new`
- `/admin/patients/[id]`
- `/admin/patients/[id]/administrative`
- `/admin/patients/[id]/encounters`
- `/admin/patients/[id]/encounters/new`
- `/admin/patients/[id]/treatment`

Private scope currently includes:

- an operational dashboard under `/admin`;
- patient management;
- attention requests with `ServiceRequest`;
- treatment cycles with `EpisodeOfCare`;
- visits with `Encounter`;
- functional metrics with `Observation`;
- signing professional configuration with `Practitioner`;
- structured clinical notes and shareable visit summaries;
- treatment clinical context edited in `/treatment` and consumed read-only in `/encounters`.

## Architectural Rules

Keep the public and private domains conceptually separate even when they share the same codebase.

Preferred read flow:

`FHIR Server -> FHIR Client -> Repository -> Mapper -> Read model / loader -> UI`

Preferred write flow:

`UI Form -> Server Action -> Zod Schema -> Domain Rules -> Repository -> FHIR payload`

Agents should avoid pushing raw FHIR concerns directly into UI components when an existing repository/mapper/read-model layer already exists.
They should also preserve the existing route-local responsibility split instead of collapsing administrative, treatment, and clinical visit concerns into one surface.

## Documentation Rules

- `README.md` is the portfolio-facing summary.
- `docs/fuente-de-verdad-operativa.md` is the detailed operational truth.
- `docs/fhir/README.md` is the active FHIR documentation index.
- `docs/archive/` holds historical or superseded material.

When changing behavior, update docs only if the contract actually changed.
Avoid ceremonial doc churn.

## Environment And Runtime

- `FHIR_BASE_URL` is required for the private/admin workflow.
- `NEXT_PUBLIC_GA_ID` is optional and only affects public-route analytics.
- `/admin` is intentionally blocked from indexing.
- The public site can be presented as deployable.
- The private admin should be presented as local/private unless a safe demo mode is explicitly implemented.
- Do not imply that mock/demo mode already exists; today it is only an audited future direction, not implemented behavior.

## Safety And Privacy

Never commit or generate:

- real patient data;
- real DNI values;
- identifiable clinical notes;
- real addresses from patient records;
- screenshots with identifiable health information;
- secrets or private environment values.

Be especially careful with:

- fixtures;
- screenshots;
- tests;
- docs;
- copied runtime examples.

If demo assets are needed, use sanitized or fictional data only.

## Change Discipline

- Do not invent features that are not in the code.
- Do not claim integrations, auth, CI, or production readiness that do not exist.
- Keep changes small and verifiable.
- Preserve existing product language when working in established surfaces.
- Start from the actual code and current docs, not from older assumptions.
- If changing visible behavior, prefer the naming and responsibilities defined in `docs/fuente-de-verdad-operativa.md`, especially for `Gestión administrativa`, `Gestión clínica`, and `Tratamiento`.

## Validation

Run the smallest reasonable verification for the scope of the change.

Common checks in this repo:

```bash
npm run lint
npm run test
FHIR_BASE_URL=http://localhost:8081/fhir npm run build
```

If a change affects routes, metadata, or documentation that describes app behavior, confirm the result stays aligned with the real codebase.
