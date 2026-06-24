# Kinesiología a Domicilio

HealthTech case study: a real-world Next.js project that combines a public patient acquisition site with a minimal private clinical workflow for home-based physiotherapy in Neuquen, Argentina.

## Demo

- Public site: https://kinesiologiaadomicilio.vercel.app
- Private clinical surface: `/admin` exists in the codebase and is intended for local development with a local HAPI FHIR server. It is not presented as a public online demo.

## Context

This project was built from an operational healthcare context, not from a generic SaaS template.

I am a physiotherapist with 20+ years of experience in home care, coordination, and audit workflows. The goal of this repository is to translate real outpatient and home-care processes into a small but coherent digital product:

- acquire and qualify demand from the public website;
- guide first contact through WhatsApp;
- keep a minimal private workflow for patients, requests, treatment cycles, and visits;
- model the private clinical workflow using FHIR R4 concepts that make sense for incremental implementation.

## Problem It Solves

Small healthcare services often operate across fragmented channels: phone calls, WhatsApp, paper notes, and memory-driven coordination. This repo explores how to digitize that reality incrementally without pretending to be a full EHR.

It focuses on the transition between:

- public demand capture;
- administrative triage;
- treatment activation;
- visit registration;
- functional follow-up;
- family-friendly visit summaries.

## Product Scope

### Public

- Marketing site for home-based physiotherapy in Neuquen.
- WhatsApp CTAs with prefilled messages.
- Guided `/evaluar` flow to orient whether a consultation makes sense.
- Technical SEO: metadata, Open Graph, JSON-LD, `robots`, `sitemap`.
- GA4 tracking limited to the public shell.

### Private Clinical

- `/admin` operational dashboard.
- Patient management.
- Attention requests (`ServiceRequest`) with administrative resolution.
- Treatment cycles with `EpisodeOfCare`.
- Home visits with `Encounter`.
- Functional metrics with `Observation`.
- Shareable visit summaries for families/caregivers.
- Signing professional configuration with `Practitioner`.

## Why This Repo Is Professionally Relevant

This project is intentionally useful for roles such as:

- HealthTech / digital health product teams
- Implementation Analyst
- Clinical Systems Analyst
- Product Analyst (HealthTech)
- Junior Full Stack Developer with healthcare domain knowledge

It demonstrates a combination of:

- clinical domain understanding;
- functional analysis grounded in real workflows;
- product scoping and incremental delivery;
- FHIR-oriented data modeling;
- pragmatic frontend/backend implementation in Next.js;
- testing and documentation discipline.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zod
- Vitest
- HAPI FHIR R4 integration for local/private workflow development
- Google Analytics 4 on public routes only

## Architecture

The repository keeps the public and private domains in the same codebase while separating responsibilities.

Read path:

`FHIR Server -> FHIR Client -> Repository -> Mapper -> Read model / loader -> UI`

Write path:

`UI Form -> Server Action -> Zod Schema -> Domain Rules -> Repository -> FHIR payload`

This matters because the UI does not work directly with raw FHIR resources. The app translates infrastructure data into route-level read models and keeps technical concerns away from the presentation layer.

## FHIR Modeling

The private workflow uses a deliberately small subset of FHIR R4:

- `Patient`: identity and administrative base
- `ServiceRequest`: incoming attention request / intake signal
- `EpisodeOfCare`: active or closed treatment cycle
- `Encounter`: home visit
- `Observation`: visit-level functional metrics
- `Practitioner`: signing professional configuration

This is not presented as a full clinical record system. It is a constrained, incremental implementation oriented to operational usefulness.

## Testing And Quality

- Automated tests cover domain rules, mappers, repositories, route data loaders, metadata, and UI slices.
- The current repository snapshot includes 97 test files and 649 passing tests.
- Public/private separation is also reinforced through route structure and search-engine blocking for `/admin`.

Available checks:

```bash
npm run lint
npm run test
npm run build
```

## Local Setup

### Requirements

- Node.js
- npm
- A local HAPI FHIR server if you want to use the private clinical surface

### Run

```bash
npm install
npm run dev
```

Default local development points to a disposable FHIR environment:

- `npm run dev` -> `http://localhost:8081/fhir`
- `npm run dev:fhir-dev` -> `http://localhost:8081/fhir`
- `npm run dev:fhir-real` -> `http://localhost:8080/fhir`

## Environment Variables

See [.env.example](./.env.example).

Current documented variables:

- `FHIR_BASE_URL`
  Server-side only. Required for the private clinical workflow.
- `NEXT_PUBLIC_GA_ID`
  Optional. Enables GA4 only on public routes.

## Screenshots

Screenshot placeholders live in [docs/screenshots/README.md](./docs/screenshots/README.md).

Recommended capture set:

- Home page
- `/services`
- `/evaluar`
- `/admin`
- `/admin/patients/[id]`
- `/admin/patients/[id]/encounters`

Important: do not add screenshots with real patient data, real phone numbers, real addresses, or identifiable clinical notes.

## Current Status

- Public website is deployable and portfolio-safe.
- Private clinical workflow exists and is meaningful, but remains intentionally minimal.
- The admin side currently depends on local infrastructure and should be read as a local clinical prototype/workflow surface, not as a production SaaS admin.
- Auth and multi-user concerns are intentionally out of scope at this stage.

## Roadmap / Next Steps

- Add sanitized screenshots or a short walkthrough GIF.
- Add a compact architecture diagram for recruiters and hiring managers.
- Expose a safe demo mode for `/admin` based on fixtures instead of local FHIR dependency.
- Continue hardening private workflow documentation around FHIR contracts and product decisions.

## Documentation Map

- [docs/README.md](./docs/README.md): active documentation map for developers and reviewers
- [docs/fuente-de-verdad-operativa.md](./docs/fuente-de-verdad-operativa.md): detailed current behavior
- [docs/fhir/README.md](./docs/fhir/README.md): active FHIR documentation index
- [docs/product/README.md](./docs/product/README.md): active product documentation index
- [docs/arquitectura-objetivo-app-clinica.md](./docs/arquitectura-objetivo-app-clinica.md): product and architecture direction

## Key Takeaways

This repo is strongest when read as a case study in healthcare workflow digitization:

- not just a landing page;
- not a generic CRUD demo;
- not a full EHR claim;
- but a realistic bridge between public acquisition, care coordination, and minimal clinical operations.
