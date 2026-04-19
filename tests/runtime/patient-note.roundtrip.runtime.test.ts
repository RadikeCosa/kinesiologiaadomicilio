import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createPatient,
  getPatientById,
  updatePatient,
} from "@/infrastructure/repositories/patient.repository";

type FetchArgs = Parameters<typeof fetch>;

interface HttpTrace {
  method: string;
  url: string;
  requestBody?: unknown;
  status?: number;
  responseBody?: unknown;
}

const shouldRun =
  process.env.RUN_FHIR_RUNTIME_TESTS === "true" &&
  Boolean(process.env.FHIR_BASE_URL?.trim());

const runtimeIt = shouldRun ? it : it.skip;

const originalFetch = global.fetch;
const httpTraces: HttpTrace[] = [];

function tryParseJson(raw: string): unknown {
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

beforeAll(() => {
  if (!shouldRun) {
    return;
  }

  global.fetch = async (...args: FetchArgs) => {
    const [input, init] = args;
    const method = init?.method ?? "GET";
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    const requestBodyRaw =
      typeof init?.body === "string" ? init.body : init?.body ? String(init.body) : "";

    const trace: HttpTrace = {
      method,
      url,
      requestBody: tryParseJson(requestBodyRaw),
    };

    const response = await originalFetch(...args);
    const responseClone = response.clone();
    const responseText = await responseClone.text();

    trace.status = response.status;
    trace.responseBody = tryParseJson(responseText);

    httpTraces.push(trace);

    return response;
  };
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe("runtime roundtrip: Patient.note against real FHIR", () => {
  runtimeIt("verifies create/read/update/read roundtrip for Patient.note", async () => {
    const uniqueTag = `NOTE-RT-${Date.now()}`;
    const initialNote = `Nota inicial ${uniqueTag}`;
    const overwrittenNote = `Nota actualizada ${uniqueTag}`;

    const created = await createPatient({
      firstName: "Runtime",
      lastName: `Paciente ${uniqueTag}`,
      phone: "+54 299 555 0199",
      notes: initialNote,
    });

    expect(created.id).toBeTruthy();

    const createdRead = await getPatientById(created.id);
    expect(createdRead).not.toBeNull();
    expect(createdRead?.notes).toContain(initialNote);

    await updatePatient({
      id: created.id,
      firstName: createdRead?.firstName,
      lastName: createdRead?.lastName,
      phone: "+54 299 555 0111",
      notes: undefined,
    });

    const afterOtherFieldUpdate = await getPatientById(created.id);
    expect(afterOtherFieldUpdate).not.toBeNull();
    expect(afterOtherFieldUpdate?.notes).toContain(initialNote);

    await updatePatient({
      id: created.id,
      firstName: createdRead?.firstName,
      lastName: createdRead?.lastName,
      notes: overwrittenNote,
    });

    const afterNoteUpdate = await getPatientById(created.id);
    expect(afterNoteUpdate).not.toBeNull();
    expect(afterNoteUpdate?.notes).toContain(overwrittenNote);

    const patientCalls = httpTraces.filter((trace) => trace.url.includes("/Patient"));

    const createCall = patientCalls.find(
      (trace) => trace.method === "POST" && trace.url.endsWith("/Patient"),
    );
    const putCalls = patientCalls.filter((trace) => trace.method === "PUT");

    expect(createCall).toBeDefined();
    expect((createCall?.requestBody as { note?: Array<{ text?: string }> } | undefined)?.note?.[0]?.text).toBe(initialNote);

    expect(putCalls.length).toBeGreaterThanOrEqual(2);

    const preserveNotePut = putCalls.find((trace) => {
      const body = trace.requestBody as { telecom?: Array<{ value?: string }>; note?: Array<{ text?: string }> } | undefined;
      return body?.telecom?.[0]?.value === "+54 299 555 0111";
    });

    const overwriteNotePut = putCalls.find((trace) => {
      const body = trace.requestBody as { note?: Array<{ text?: string }> } | undefined;
      return body?.note?.[0]?.text === overwrittenNote;
    });

    expect(preserveNotePut).toBeDefined();
    expect(overwriteNotePut).toBeDefined();

    console.log("FHIR runtime trace summary", {
      createRequestNote: (createCall?.requestBody as { note?: Array<{ text?: string }> } | undefined)?.note,
      createResponseNote: (createCall?.responseBody as { note?: Array<{ text?: string }> } | undefined)?.note,
      preserveNotePutRequestNote: (preserveNotePut?.requestBody as { note?: Array<{ text?: string }> } | undefined)?.note,
      preserveNotePutResponseNote: (preserveNotePut?.responseBody as { note?: Array<{ text?: string }> } | undefined)?.note,
      overwriteNotePutRequestNote: (overwriteNotePut?.requestBody as { note?: Array<{ text?: string }> } | undefined)?.note,
      overwriteNotePutResponseNote: (overwriteNotePut?.responseBody as { note?: Array<{ text?: string }> } | undefined)?.note,
      finalGetNotes: afterNoteUpdate?.notes,
      patientId: created.id,
    });
  }, 120_000);
});
