# Build Plan — `starter-project-T2`

- **Source:** `r3nd/tech_specs/2026-09-27-starter-project/2026-09-27-tech-spec-starter-project.md`
- **Task:** `T2 — Backend modules and data`
- **Outcome:** Modular Nest API reads the seeded PostgreSQL greeting and exposes public, protected, and health endpoints.
- **Status:** In Progress

## Scope

- **In:** Hello and Identity facades, Drizzle schema/migration/seed, contracts, probes, request logging, dev Swagger.
- **Out:** Browser auth UI and packaged Core supervision (T3).
- **Depends on:** T1.

## Contracts And Non-Obvious Details

- **Consumes:** `@starter/shared`; verified session user ID from Identity facade.
- **Exposes:** `GET /api/hello`, `GET /api/hello/personal`, `/health/live`, `/health/ready`.
- **Packages/tooling:** NestJS, Drizzle ORM/Kit, `pg`, class-validator, SuperTokens SDK.
- **Custom code boundary:** Module-owned repositories, facade adapters, and pure response mappings.
- **Data/migration rule:** Initial additive migration owns `hello_messages` and `user_profiles`; seed inserts `default` greeting only when absent. Rollback uses prior image/database backup; migrations are never automatically reversed.

## Production Baseline

- **CI:** Unit tests cover public/personal output and failure/auth edges.
- **Runtime/config:** Migrations run before readiness; configuration validates DB/Core settings on startup.
- **Security/auth/tenancy:** No tenant scope; personal route trusts only a verified session user ID.
- **Compatibility:** New API and stored data.
- **Operability:** JSON request/error logs; liveness is process-only, readiness checks PostgreSQL and Core.

## Implementation

- [ ] `apps/api/src/modules/hello` — private schema/repository/use case/controller and public facade.
- [ ] `apps/api/src/modules/identity` — public identity facade/profile repository and session guard.
- [ ] `apps/api/src/infrastructure` — Drizzle connection, migration/seed scripts and probes.
- [ ] Tests — focused API-module behavior and failure cases.

## Tests And Verification

- [ ] Unit: shared greeting output and missing message/session conditions.
- [ ] Unit: unauthorized personal request and profile lookup failure.
- [ ] Boundary/contract: PostgreSQL/Core flow is completed in T3.
- [ ] CI-equivalent checks and production runtime smoke after T3.
- **Optional QA candidate:** Public greeting and 401 personal endpoint.

## Blocking Questions

- None.
