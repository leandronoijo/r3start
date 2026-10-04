# Build Plan — `starter-project-T3`

- **Source:** `r3nd/tech_specs/2026-09-27-starter-project/2026-09-27-tech-spec-starter-project.md`
- **Task:** `T3 — SuperTokens and web flow`
- **Outcome:** Same-origin React signup/login/logout and personalized greeting run in dev and production Compose.
- **Status:** In Progress

## Scope

- **In:** SuperTokens Core/SDK wiring, full-name profile persistence, React UI, Tailwind theme, ingress/static routes, production process supervision.
- **Out:** Email verification, password recovery, social login, tenant support, metrics.
- **Depends on:** T1 and T2.

## Contracts And Non-Obvious Details

- **Consumes:** `/auth`, Hello endpoints, Identity facade.
- **Exposes:** Prebuilt SuperTokens auth routes/UI and static React app.
- **Packages/tooling:** `supertokens-node`, `supertokens-auth-react`, EmailPassword/Session recipes, React/Vite/Tailwind v4.
- **Custom code boundary:** Signup full-name validation/profile write and presentation request adapters.
- **Algorithm/state rule:** Signup succeeds only after the profile write; profile-write failure is reported as an auth error and compensates Core user creation where SDK support permits.
- **Data/migration rule:** Core owns its tables; Drizzle never reads or writes them.

## Production Baseline

- **CI:** Includes image build and focused tests.
- **Runtime/config:** Core remains private, only app ingress is published, and readiness checks app DB/Core.
- **Security/auth/tenancy:** Same-origin cookie session; validated full name; no client user ID/full name is trusted.
- **Compatibility:** New interface.
- **Operability:** child process and Core lifecycle logs; SIGTERM closes Nest/DB/Core.

## Implementation

- [ ] Identity recipe wiring — full-name signup field and session verification.
- [ ] `apps/web` — prebuilt auth screens and immutable greeting display state.
- [ ] `Dockerfile`/Compose — Core runtime, static serving, no Core host port.
- [ ] Boundary test — signup, personalized route, logout, and Core readiness failure.

## Tests And Verification

- [ ] Unit: full-name validation and persistence-failure compensation.
- [ ] Boundary/contract: Core + PostgreSQL protected greeting lifecycle.
- [ ] CI-equivalent checks: root lint/format/type/test/build and production image build.
- [ ] Runtime smoke: both Compose modes, readiness and absent production Swagger.
- **Optional QA candidate:** Browser signup/login/logout, 401 after logout, hot reload and dependency outage.

## Blocking Questions

- None.
