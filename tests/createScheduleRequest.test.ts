import assert from "node:assert/strict";
import { test } from "node:test";
import { createSchedule } from "@/lib/api/createSchedule";

const input = { department: "ER", weekStartDate: "2026-09-14" } as const;

test("client sends the request and accepts a validated success", async (t) => {
  const body = { ok: true, data: { schedule: { id: "created" } } };
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(body, { status: 201 }));
  assert.deepEqual(await createSchedule(input), body);
  assert.deepEqual(fetch.mock.calls[0]?.arguments, ["/api/admin/schedules/create", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  }]);
});

test("client returns API failures including duplicate details and issues", async (t) => {
  for (const [code, status] of [
    ["INVALID_JSON", 400], ["INVALID_INPUT", 400], ["UNAUTHENTICATED", 401],
    ["FORBIDDEN", 403], ["NOT_FOUND", 404], ["SCHEDULE_ALREADY_EXISTS", 409], ["INTERNAL_ERROR", 500],
  ] as const) {
    const body = {
      ok: false,
      error: { code, message: "Safe error message",
        ...(code === "SCHEDULE_ALREADY_EXISTS" ? { details: { scheduleId: "existing" } } : {}),
        ...(code === "INVALID_INPUT" ? { issues: [{ code: "INVALID_DATE", message: "Invalid date", field: "weekStartDate" }] } : {}),
      },
    };
    const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(body, { status }));
    assert.deepEqual(await createSchedule(input), body);
    fetch.mock.restore();
  }
});

test("client rejects untrusted or inconsistent responses", async (t) => {
  const invalidResponses = [
    Response.json(null),
    Response.json({ ok: true, data: {} }),
    Response.json({ ok: true, data: { schedule: { id: 42 } } }),
    Response.json({ ok: true, data: { schedule: { id: "" } } }),
    Response.json({ ok: false, error: "legacy response" }, { status: 401 }),
    Response.json({ ok: false, error: { code: "UNKNOWN", message: "unknown" } }, { status: 400 }),
    Response.json({ ok: false, error: { code: "SCHEDULE_ALREADY_EXISTS", message: "duplicate" } }, { status: 409 }),
    Response.json({ ok: false, error: { code: "INVALID_INPUT", message: 5 } }, { status: 400 }),
    Response.json({ ok: false, error: { code: "INVALID_INPUT", message: "invalid", issues: [{ code: "x" }] } }, { status: 400 }),
    Response.json({ ok: false, error: { code: "INVALID_INPUT", message: "invalid", details: { scheduleId: 3 } } }, { status: 400 }),
    Response.json({ ok: true, data: { schedule: { id: "created" } } }, { status: 500 }),
    Response.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "failed" } }, { status: 200 }),
    new Response("<html>Proxy error</html>", { status: 502 }),
    new Response(null, { status: 204 }),
  ];
  for (const response of invalidResponses) {
    const fetch = t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(createSchedule(input));
    fetch.mock.restore();
  }
});

test("client propagates transport failures for UI catch/finally handling", async (t) => {
  const failure = new TypeError("Network unavailable");
  t.mock.method(globalThis, "fetch", async () => { throw failure; });
  await assert.rejects(createSchedule(input), (error) => error === failure);
});
