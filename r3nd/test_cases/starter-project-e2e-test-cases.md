# E2E Test Cases — Starter Project

- **Feature ID:** `starter-project`
- **Tech Spec:** `r3nd/tech_specs/2026-09-27-starter-project/2026-09-27-tech-spec-starter-project.md`
- **Build Plan(s):** `r3nd/build_plans/starter-project-T1-build-plan.md`, `r3nd/build_plans/starter-project-T2-build-plan.md`, `r3nd/build_plans/starter-project-T3-build-plan.md`
- **Date:** `2026-09-30`

## `starter-project-TC-01` — Signup, personal greeting, logout and login

- **Given:** A fresh browser context and a healthy runtime with the seeded greeting.
- **When:** Open `/`, use the sign-in/signup action, and sign up through the SuperTokens form with full name `Ada Lovelace`, a unique email and a valid password. Return to the greeting page, refresh it, sign out, then sign in with the same credentials.
- **Then:** The anonymous page displays `Hello world`. Signup and login display `Hello Ada Lovelace` with the same database message; a page refresh preserves the authenticated greeting. Logout restores the public page, and a fresh request to `/api/hello/personal` returns 401. Login restores the stored full name without asking for it again. Browser auth requests stay on the page origin.
- **Setup:** Run once in development and once in production; use a distinct email per run and await `/health/ready` 200. Map: FR1, FR2, FR4.

## `starter-project-TC-02` — Personal greeting trusts the verified session

- **Given:** An anonymous context and two isolated browser contexts signed in as accounts with different full names.
- **When:** Request `/api/hello/personal` anonymously; request it from each signed-in context with forged `userId` and `fullName` query parameters referring to the other account.
- **Then:** Anonymous access returns 401 without personal data. Each authenticated response contains only that session's stored full name and the common message; query parameters cannot change identity. The public endpoint remains accessible anonymously.
- **Setup:** Both runtimes; reuse TC-01's account and create one additional account. Map: FR2 and the identity/security baseline; tenancy is not applicable.

## `starter-project-TC-03` — Database message updates and account data survive restart

- **Given:** A healthy runtime and an existing signed-up account; record the current `default` greeting row.
- **When:** Update only `hello_messages.message` for key `default` to a unique fixture message, request both greeting endpoints, restart the application services while retaining the PostgreSQL volume, then sign in again and request both endpoints.
- **Then:** Public and personal endpoints return the updated message on their next requests. After restart, the message is still the fixture value and the existing account retains its full name; startup seeding does not overwrite it or duplicate the row.
- **Setup:** Both runtimes; use Compose's `pg` service for the application-table fixture and restore the recorded message afterward. Restart `api`/`supertokens` in dev or `app` in prod. Map: FR1, FR2 and compatibility/data baseline.

## `starter-project-TC-04` — Dependency or greeting loss fails safely and recovers

- **Given:** A healthy runtime and a signed-in account. Apply one fault at a time: stop PostgreSQL, make Core unreachable without stopping Nest, or temporarily remove the `default` greeting row.
- **When:** Request `/health/live`, `/health/ready`, the public greeting and the personal greeting, then restore the dependency or recorded row and repeat the requests.
- **Then:** While Nest is running, liveness remains 200 and readiness becomes 503 within a bounded request timeout. Database/message loss returns safe 503 greeting errors and a readable browser error; Core loss prevents successful new authentication and reports a safe auth error. Responses expose no database details or credentials. After restoration, readiness and the affected greeting/auth flows recover without rebuilding or recreating accounts.
- **Setup:** Both runtimes; bound Core/DB faults using reversible stop/pause or network controls and always restore in cleanup. Restore the row directly before any seed/restart can recreate it. Map: FR3, message lifecycle and operability/security baseline. Do not require public greeting failure for a Core-only outage.

## `starter-project-TC-05` — Production supervision restarts a failed child

- **Given:** Healthy production Compose with exactly `app` and `pg`, plus an existing account and PostgreSQL volume.
- **When:** Terminate the bundled Core child, wait for Compose restart/readiness, then independently terminate the Nest child and wait again.
- **Then:** Each child exit terminates the supervised application container and increases its restart count. The container returns to healthy readiness within a bounded timeout; public greeting and login/personal greeting work afterward with retained account data. Core is not exposed through a published host port.
- **Setup:** Production only; record container restart count before each fault and use process discovery inside `app`. Map: FR4 and runtime/operability baseline.

## `starter-project-TC-06` — Browser and operational routes reach their intended boundary

- **Given:** Healthy development and production runtimes.
- **When:** Load `/` and `/auth` directly, submit an auth form, request both health endpoints, and request `/docs`, `/docs-json` plus a nonexistent path under `/api`, `/auth` and `/health`.
- **Then:** Browser routes load the React/auth UI and auth submissions reach the API on the same origin. Health responses are JSON. Development exposes Swagger UI and its document; production Swagger requests return 404. Unknown server routes return safe server errors rather than the React HTML shell.
- **Setup:** Run against each runtime's single published HTTP origin. Map: FR3, FR4 and route/config/security decisions.

## `starter-project-TC-07` — Development source changes appear without rebuilding

- **Given:** Healthy development Compose with API/web source mounts; record container IDs and the original source contents.
- **When:** Make one reversible visible web-text change and one reversible API-response change, wait for Vite/Nest watch updates, then reload/request through nginx.
- **Then:** Both changes become observable without an image rebuild or container recreation; the browser remains on the same origin. Restoring the sources restores the original behavior.
- **Setup:** Development only; restore both files in cleanup before running other cases. Map: FR4.

## Notes

- Use `docker compose -f compose.dev.yml up --build` at `http://localhost:8080` or `docker compose -f compose.prod.yml up --build` at `http://localhost:3000`. Start the modes separately or with isolated Compose project names; keep their fixture data separate.
- Supply runtime environment values from `.env.example`; production requires a nonempty matching Core/API key. Apply app migrations and seed through the existing npm/container commands before development tests when startup has not done so. Production startup performs these steps. Use the configured HTTPS origin when cookie settings require TLS.
- Select controls by accessible labels/roles from the implemented UI, including the SuperTokens email/password/full-name fields. Observe requests through the public ingress; do not bypass it with internal API ports.
- These are acceptance cases, not recorded QA results. Existing unit/boundary coverage owns detailed full-name validation and signup profile-write compensation; repeat those only if a distinct browser/runtime failure is found. No tenant, browser-matrix or load suite is needed for this slice.
