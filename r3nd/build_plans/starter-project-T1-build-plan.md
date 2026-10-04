# Build Plan — `starter-project-T1`

- **Source:** `r3nd/tech_specs/2026-09-27-starter-project/2026-09-27-tech-spec-starter-project.md`
- **Task:** `T1 — Workspace and delivery shell`
- **Outcome:** Installable npm workspace with API, web, shared contracts, quality scripts, CI, and development/production container entry points.
- **Status:** In Progress

## Scope

- **In:** npm workspaces, TypeScript, lint/format/type/build scripts, Dockerfile, Compose, nginx, environment example, CI.
- **Out:** Product API and authentication behavior (T2/T3).
- **Depends on:** None.

## Contracts And Non-Obvious Details

- **Consumes:** Environment variables documented in `.env.example`.
- **Exposes:** `@starter/shared` transport types and root workspace commands.
- **Packages/tooling:** npm workspaces, TypeScript, ESLint, Prettier, Vite, NestJS, Docker Compose.
- **Custom code boundary:** Configuration and container glue only.
- **Data/migration rule:** Not applicable — schema begins in T2.

## Production Baseline

- **CI:** GitHub workflow runs lockfile install, lint, format check, typecheck, tests, build, and production image build.
- **Runtime/config:** One production image and separate dev/prod Compose files; runtime secrets are injected only through environment variables.
- **Security/auth/tenancy:** No credentials committed; auth arrives in T3.
- **Compatibility:** New private interface; no migration window required.
- **Operability:** Docker health endpoint is supplied by T2.

## Implementation

- [ ] Root manifests and shared package — locked workspace tooling and public DTOs.
- [ ] `Dockerfile`, Compose and nginx config — local development ingress and production image shape.
- [ ] `.github/workflows/ci.yml` — deterministic repository checks.

## Tests And Verification

- [ ] CI-equivalent checks: `npm ci`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`, `docker build`.
- [ ] Runtime smoke: production Compose after T2/T3 supply the app.
- **Optional QA candidate:** Page loads through same-origin ingress.

## Blocking Questions

- None.
