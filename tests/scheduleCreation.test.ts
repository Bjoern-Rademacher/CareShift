import assert from "node:assert/strict";
import { mock, test } from "node:test";

import type { CurrentUser } from "@/types/auth";
import type { TemplateRule } from "@/types/scheduling";

test("schedule creation use case and HTTP boundary", async (t) => {
  let existingSchedule: { id: string } | null = null;
  let databaseFailure: Error | null = null;
  let createFailure: Error | null = null;
  let authFailure: Error | null = null;
  let currentUser: CurrentUser | null = {
    role: "ADMIN", firstName: "Test", lastName: "Admin", employeeId: "admin",
  };
  const rule: TemplateRule = {
    id: "rule", department: "ER", position: "NURSE", weekdays: ["MON"],
    startTimeLocal: "08:00", endTimeLocal: "16:00", slots: 2, active: true,
  };
  const lookup = mock.fn(async () => {
    if (databaseFailure) throw databaseFailure;
    return existingSchedule;
  });
  const create = mock.fn(async (
    input: Parameters<typeof import("@/lib/db/schedulePeriods").createSchedulePeriodFromTemplate>[0],
  ) => {
    if (createFailure) throw createFailure;
    return { id: "created-schedule", ...input, status: "DRAFT" };
  });
  const rules = mock.fn(async () => [rule]);
  const modules = [
    mock.module("../src/lib/db/schedulePeriods.ts", {
      namedExports: {
        getSchedulePeriodByDepartmentAndStartDate: lookup,
        createSchedulePeriodFromTemplate: create,
      },
    }),
    mock.module("../src/lib/db/templateRules.ts", {
      namedExports: { getTemplateRulesByDepartment: rules },
    }),
    mock.module("../src/lib/auth/currentUser.ts", {
      namedExports: {
        getCurrentUser: async () => {
          if (authFailure) throw authFailure;
          return currentUser;
        },
      },
    }),
  ];
  t.after(() => modules.forEach((module) => module.restore()));

  const { generateScheduleFromTemplate } = await import("@/lib/useCases/createScheduleFromTemplate");
  const { POST } = await import("@/app/api/admin/schedules/create/route");
  const { redirect, notFound } = await import("next/navigation");
  const input = { department: "ER", weekStartDate: new Date("2026-09-16") } as const;
  const request = (value: unknown = { department: "ER", weekStartDate: "2026-09-16" }) =>
    new Request("http://localhost/api/admin/schedules/create", {
      method: "POST", body: JSON.stringify(value),
    });

  await t.test("success returns explicit data and preserves generated dates and slots", async () => {
    assert.deepEqual(await generateScheduleFromTemplate(input), {
      ok: true, data: { schedule: { id: "created-schedule" } },
    });
    const call = create.mock.calls.at(-1);
    assert.ok(call);
    assert.equal(call.arguments[0].startDate.toISOString(), "2026-09-14T00:00:00.000Z");
    assert.equal(call.arguments[0].endDate.toISOString(), "2026-09-21T00:00:00.000Z");
    assert.equal(call.arguments[0].shiftSlots.length, 2);
    const response = await POST(request());
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
      ok: true, data: { schedule: { id: "created-schedule" } },
    });
  });

  await t.test("existing schedule is a typed failure and HTTP 409 without writes", async () => {
    existingSchedule = { id: "existing-schedule" };
    const writes = create.mock.callCount();
    const ruleReads = rules.mock.callCount();
    assert.deepEqual(await generateScheduleFromTemplate(input), {
      ok: false,
      error: {
        code: "SCHEDULE_ALREADY_EXISTS",
        message: "A schedule already exists for this department and week.",
        details: { scheduleId: "existing-schedule" },
      },
    });
    const response = await POST(request());
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: {
        code: "SCHEDULE_ALREADY_EXISTS",
        message: "A schedule already exists for this department and week.",
        details: { scheduleId: "existing-schedule" },
      },
    });
    assert.equal(create.mock.callCount(), writes);
    assert.equal(rules.mock.callCount(), ruleReads);
    existingSchedule = null;
  });

  await t.test("invalid values are HTTP 400 INVALID_INPUT before database access", async () => {
    const reads = lookup.mock.callCount();
    for (const value of [null, [], {}, { department: "OTHER", weekStartDate: "2026-09-14" },
      { department: "ER", weekStartDate: "2026-02-30" },
      { department: "ER", weekStartDate: 123 },
      { department: "ER", weekStartDate: "2026-09-14T00:00:00Z" }]) {
      const response = await POST(request(value));
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), {
        ok: false, error: {
          code: "INVALID_INPUT", message: "Department and a valid week start date are required.",
        },
      });
    }
    assert.equal(lookup.mock.callCount(), reads);
  });

  await t.test("malformed and empty JSON are distinct from invalid input", async () => {
    for (const body of ["{", ""]) {
      const response = await POST(new Request("http://localhost", { method: "POST", body }));
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), {
        ok: false, error: { code: "INVALID_JSON", message: "Request body must contain valid JSON." },
      });
    }
  });

  await t.test("authentication and authorization keep 401/403 and use the envelope", async () => {
    const admin = currentUser;
    const reads = lookup.mock.callCount();
    currentUser = null;
    const unauthenticated = await POST(request(null));
    assert.equal(unauthenticated.status, 401);
    assert.deepEqual(await unauthenticated.json(), {
      ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required." },
    });
    for (const role of ["EMPLOYEE", "DISPLAY"] as const) {
      currentUser = role === "EMPLOYEE"
        ? { role, firstName: "Test", lastName: "Employee", employeeId: "employee" }
        : { role, firstName: "Test", lastName: "Display" };
      const forbidden = await POST(request());
      assert.equal(forbidden.status, 403);
      assert.deepEqual(await forbidden.json(), {
        ok: false, error: { code: "FORBIDDEN", message: "Administrator access required." },
      });
    }
    assert.equal(lookup.mock.callCount(), reads);
    currentUser = admin;
  });

  await t.test("unexpected failures propagate from use case and are logged safely at boundary", async (t) => {
    const failure = new Error("Database credentials and internal stack must stay on the server");
    const log = t.mock.method(console, "error", () => {});
    databaseFailure = failure;
    await assert.rejects(generateScheduleFromTemplate(input), (error) => error === failure);
    const databaseResponse = await POST(request());
    databaseFailure = null;
    createFailure = failure;
    await assert.rejects(generateScheduleFromTemplate(input), (error) => error === failure);
    const createResponse = await POST(request());
    createFailure = null;
    authFailure = failure;
    const authResponse = await POST(request());
    authFailure = null;
    const brokenBody = request();
    t.mock.method(brokenBody, "json", async () => { throw failure; });
    const bodyResponse = await POST(brokenBody);
    for (const response of [databaseResponse, createResponse, authResponse, bodyResponse]) {
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), {
        ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to create schedule." },
      });
    }
    assert.equal(log.mock.callCount(), 4);
    for (const call of log.mock.calls) assert.equal(call.arguments[1], failure);
  });

  await t.test("Next.js redirect and notFound propagate without logging or conversion", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    for (const controlFlow of [() => redirect("/login"), () => notFound()]) {
      let signal: unknown;
      try { controlFlow(); } catch (error) { signal = error; }
      assert.ok(signal instanceof Error);
      authFailure = signal;
      await assert.rejects(POST(request()), (error) => error === signal);
      authFailure = null;
      databaseFailure = signal;
      await assert.rejects(POST(request()), (error) => error === signal);
      databaseFailure = null;
    }
    assert.equal(log.mock.callCount(), 0);
  });
});
