import { beforeEach, vi } from "vitest";

vi.mock("@/lib/fhir/client", () => ({
  fhirClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import { FhirClientError } from "@/lib/fhir/errors";
import { DNI_IDENTIFIER_SYSTEM } from "@/lib/fhir/identifiers";
import type { FhirBundle } from "@/lib/fhir/types";
import { fhirClient } from "@/lib/fhir/client";
import type { FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";
import type { FhirPatient } from "@/infrastructure/mappers/patient/patient-fhir.types";

interface TestStore {
  patients: FhirPatient[];
  episodes: FhirEpisodeOfCare[];
  nextPatientSequence: number;
  nextEpisodeSequence: number;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildSeedTimestamp(day: number): string {
  return new Date(Date.UTC(2026, 3, day, 12, 0, 0)).toISOString();
}

function buildMutationTimestamp(offset: number): string {
  return new Date(Date.UTC(2026, 3, 19, 12, offset, 0)).toISOString();
}

function createSeedStore(): TestStore {
  return {
    patients: [
      {
        resourceType: "Patient",
        id: "pat-001",
        meta: { lastUpdated: buildSeedTimestamp(10) },
        name: [{ family: "SinDni", given: ["Paciente"] }],
      },
      {
        resourceType: "Patient",
        id: "pat-002",
        meta: { lastUpdated: buildSeedTimestamp(11) },
        name: [{ family: "Listo", given: ["Paciente"] }],
        identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "32123456" }],
      },
      {
        resourceType: "Patient",
        id: "pat-003",
        meta: { lastUpdated: buildSeedTimestamp(12) },
        name: [{ family: "Activo", given: ["Paciente"] }],
        identifier: [{ system: DNI_IDENTIFIER_SYSTEM, value: "30999888" }],
      },
    ],
    episodes: [
      {
        resourceType: "EpisodeOfCare",
        id: "ep-001",
        status: "active",
        patient: { reference: "Patient/pat-003" },
        period: { start: "2026-04-15" },
      },
    ],
    nextPatientSequence: 100,
    nextEpisodeSequence: 100,
  };
}

const store: TestStore = createSeedStore();

function resetStore(): void {
  const next = createSeedStore();
  store.patients = next.patients;
  store.episodes = next.episodes;
  store.nextPatientSequence = next.nextPatientSequence;
  store.nextEpisodeSequence = next.nextEpisodeSequence;
}

function buildBundle<TResource extends { resourceType: string }>(resources: TResource[]): FhirBundle<TResource> {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: resources.length,
    entry: resources.map((resource) => ({ resource: clone(resource) })),
  };
}

function buildMockUrl(path: string): string {
  return `http://test.local/fhir/${path}`;
}

function throwNotFound(method: "GET" | "PUT", path: string): never {
  throw new FhirClientError({
    message: `FHIR ${method} ${buildMockUrl(path)} failed with status 404`,
    method,
    url: buildMockUrl(path),
    status: 404,
  });
}

function extractId(path: string): string {
  return path.split("/").at(-1) ?? "";
}

function getPatientDni(patient: FhirPatient): string | undefined {
  return patient.identifier?.find((identifier) => identifier.system === DNI_IDENTIFIER_SYSTEM)?.value;
}

function handleGet(path: string): unknown {
  if (path.startsWith("Patient/")) {
    const patient = store.patients.find((item) => item.id === extractId(path));
    return patient ? clone(patient) : throwNotFound("GET", path);
  }

  if (path === "Patient" || path.startsWith("Patient?")) {
    const params = new URLSearchParams(path.split("?")[1] ?? "");
    const identifier = params.get("identifier");
    const dni = identifier?.split("|").at(-1);
    const patients = dni ? store.patients.filter((patient) => getPatientDni(patient) === dni) : store.patients;

    return buildBundle(patients);
  }

  if (path.startsWith("EpisodeOfCare/")) {
    const episode = store.episodes.find((item) => item.id === extractId(path));
    return episode ? clone(episode) : throwNotFound("GET", path);
  }

  if (path === "EpisodeOfCare" || path.startsWith("EpisodeOfCare?")) {
    const params = new URLSearchParams(path.split("?")[1] ?? "");
    const patientReference = params.get("patient");
    const status = params.get("status");

    const filtered = store.episodes.filter((episode) => {
      const matchesPatient = patientReference ? episode.patient?.reference === patientReference : true;
      const matchesStatus = status ? episode.status === status : true;

      return matchesPatient && matchesStatus;
    });

    return buildBundle(filtered);
  }

  throw new Error(`Unhandled mocked GET path: ${path}`);
}

function handlePost(path: string, body: unknown): unknown {
  if (path === "Patient") {
    const patientSequence = store.nextPatientSequence++;
    const created: FhirPatient = {
      ...(body as FhirPatient),
      resourceType: "Patient",
      id: `pat-${String(patientSequence).padStart(3, "0")}`,
      meta: { lastUpdated: buildMutationTimestamp(patientSequence) },
    };

    store.patients.push(created);
    return clone(created);
  }

  if (path === "EpisodeOfCare") {
    const episodeSequence = store.nextEpisodeSequence++;
    const created: FhirEpisodeOfCare = {
      ...(body as FhirEpisodeOfCare),
      resourceType: "EpisodeOfCare",
      id: `ep-${String(episodeSequence).padStart(3, "0")}`,
    };

    store.episodes.push(created);
    return clone(created);
  }

  throw new Error(`Unhandled mocked POST path: ${path}`);
}

function handlePut(path: string, body: unknown): unknown {
  if (path.startsWith("Patient/")) {
    const id = extractId(path);
    const index = store.patients.findIndex((item) => item.id === id);

    if (index < 0) {
      return throwNotFound("PUT", path);
    }

    const updated: FhirPatient = {
      ...(body as FhirPatient),
      resourceType: "Patient",
      id,
      meta: { lastUpdated: buildMutationTimestamp(index + 1) },
    };

    store.patients[index] = updated;
    return clone(updated);
  }

  if (path.startsWith("EpisodeOfCare/")) {
    const id = extractId(path);
    const index = store.episodes.findIndex((item) => item.id === id);

    if (index < 0) {
      return throwNotFound("PUT", path);
    }

    const updated: FhirEpisodeOfCare = {
      ...(body as FhirEpisodeOfCare),
      resourceType: "EpisodeOfCare",
      id,
    };

    store.episodes[index] = updated;
    return clone(updated);
  }

  throw new Error(`Unhandled mocked PUT path: ${path}`);
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();

  vi.mocked(fhirClient.get).mockImplementation(async (path: string) => handleGet(path));
  vi.mocked(fhirClient.post).mockImplementation(async (path: string, body: unknown) => handlePost(path, body));
  vi.mocked(fhirClient.put).mockImplementation(async (path: string, body: unknown) => handlePut(path, body));
});
