# Schedule creation error handling

This migration covers `generateScheduleFromTemplate`,
`POST /api/admin/schedules/create`, `createSchedule`, the creation page, and
the compact `CreateScheduleButton` used by schedule lists and dashboards.

`src/types/useCases/result.ts` defines `UseCaseSuccess<TData>`,
`UseCaseFailure<TError>`, and their shared `UseCaseResult<TData, TError>` union.
Every use-case error requires a string `code` and `message`.
The creation input, success data, expected error, and result are explicit in
`src/types/useCases/createScheduleFromTemplate.ts`. They do not depend on API
or HTTP types. Duplicate schedules require `details.scheduleId` on the
use-case error. Unexpected exceptions propagate to the route.

The supplied `src/types/api.ts` contract and existing `CreateScheduleResponse`
remain unchanged. The route maps results to this contract:

| Outcome | HTTP status | Error code |
| --- | --- | --- |
| Created | 201 | — |
| Malformed or empty JSON | 400 | `INVALID_JSON` |
| Invalid department or date | 400 | `INVALID_INPUT` |
| Missing authentication | 401 | `UNAUTHENTICATED` |
| Non-admin user | 403 | `FORBIDDEN` |
| Existing department/week | 409 | `SCHEDULE_ALREADY_EXISTS` |
| Unexpected exception | 500 | `INTERNAL_ERROR` |

The route adapts existing authorization failures locally. Its boundary includes
authentication, JSON reading, validation, and the use case. It rethrows Next.js
control flow before logging unexpected exceptions server-side and returning
only a fixed safe message. The shared JSON parser classifies only `SyntaxError`
as malformed JSON; other body-reading exceptions propagate to the caller.
The existing transaction and schedule generation rules are unchanged.

The request helper validates unknown response JSON, including optional issues
and details, and rejects HTTP/envelope success mismatches. API failures are
returned. Transport failures and invalid responses reject. Both UI consumers
handle these rejections and release their loading state in `finally`.

## Contract limitations

`ApiErrorResponse` makes `issues` and `details` optional for every code. It
cannot express that a particular error requires a particular payload, and
checking `error.code` does not narrow `details`. The use-case union enforces
required duplicate details, and the client runtime validator requires the
duplicate schedule ID. The UI retains optional access because the unchanged
API type cannot guarantee it. The contract also does not encode HTTP status
or transport failures; those remain boundary concerns.

## Verification

With the repository's Node 24 environment, run `npm run test:schedule-creation`.
The tests use Node's built-in test runner and experimental module mocking with
the existing `tsx` dependency; no validation or testing library was added.
The script runs the two test files in separate processes. To bypass npm's shell
launcher when `/bin/sh` is unavailable, run:

```sh
node --experimental-test-module-mocks --import tsx tests/scheduleCreation.test.ts
node --import tsx tests/createScheduleRequest.test.ts
node node_modules/eslint/bin/eslint.js
node node_modules/typescript/bin/tsc --noEmit
```

Behavioral tests cover generation success, duplicate failures, input validation,
malformed JSON, authorization, safe unexpected failures, Next.js control flow,
API failures, transport failures, and invalid server responses. Database access
is mocked; these are not database integration or browser interaction tests.

Other flows still need migration: assignment and candidate lookup, bulk
assignment, autofill, validation/publication, reopening, clearing assignments,
schedule/employee/dashboard reads, and authentication endpoints. Their existing
response shapes and use-case types are intentionally retained.
