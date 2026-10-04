```yaml
apps:
  - name: api
    path: apps/api
    purpose: HTTP API, authentication integration, persistence, and static production web delivery
    stack: NestJS 11, TypeScript, Drizzle ORM, PostgreSQL, SuperTokens
  - name: web
    path: apps/web
    purpose: Browser client for public and authenticated greeting flows
    stack: React 19, Vite 6, React Router, Tailwind CSS, SuperTokens React
  - name: shared
    path: packages/shared
    purpose: Shared public API response contracts
    stack: TypeScript
```

# Project Overview

This npm-workspaces repository delivers a browser client, a NestJS API, and a small shared-contract package. PostgreSQL stores application data; SuperTokens Core provides EmailPassword authentication and session management. Development Compose runs PostgreSQL, SuperTokens, API, Vite, and nginx. Production Compose runs PostgreSQL plus one application image that starts SuperTokens Core and the API together and serves the built web client.

# Repo-Level Conventions

- Use npm workspaces and the existing package names: `@starter/api`, `@starter/web`, and `@starter/shared`.
- Keep TypeScript strict and formatted with Prettier. Run root scripts instead of adding per-package tooling without a demonstrated need.
- Build `packages/shared` before code that imports its published `dist` types; the root `typecheck` and `build` scripts enforce that order.
- Add API response shapes to `packages/shared/src/index.ts` and import them by package name. Do not duplicate those transport types in the web app or API.
- Keep feature code in `apps/api/src/modules/<feature>/` with `application`, `ports`, and `adapters` layers. Controllers are adapters; facades own application behavior; ports define dependency contracts; Drizzle implementations remain adapters.
- Put database schemas beside their feature adapters so the Drizzle glob in `apps/api/drizzle.config.ts` discovers them. Generate migrations with the API workspace command; never edit generated migration metadata manually.
- Validate configuration centrally through `apps/api/src/infrastructure/config.ts`. Required values belong in `.env.example`; do not read unvalidated environment variables in feature code.
- Treat client input as untrusted. Nest's global `ValidationPipe` already enables transformation and whitelisting; preserve it when adding controllers and DTOs.

# Shared Tooling and Commands

Install locked dependencies with `npm ci`.

| Purpose | Command |
| --- | --- |
| Start API outside Compose | `npm run dev:api` |
| Start web outside Compose | `npm run dev:web` |
| Lint | `npm run lint` |
| Check formatting | `npm run format:check` |
| Run all workspace tests | `npm test` |
| Type-check all packages | `npm run typecheck` |
| Build all packages | `npm run build` |
| Generate a DB migration | `npm run db:generate` |
| Apply migrations | `npm run db:migrate` |
| Seed application data | `npm run db:seed` |
| Start development services | `docker compose --env-file .env.example -f compose.dev.yml up --build` |
| Start production-like services | `docker compose --env-file .env.example -f compose.prod.yml up --build` |

# Cross-App Boundaries and Integration Rules

- The web app calls API endpoints relative to its current origin. Keep nginx and production static serving aligned with that model; do not introduce browser-facing service hostnames.
- `/api/*`, `/health/*`, and `/docs/*` are API routes. `/auth/*` GET and HEAD requests render the React auth UI; auth mutations route to the Nest/SuperTokens middleware. Preserve this split in `docker/nginx.dev.conf`.
- Public routes can use the public greeting facade method. Protect user-specific routes with `SessionGuard`, obtain the user id from the verified server-side session, and never accept a user id from the client as identity.
- SuperTokens initialization belongs in `apps/api/src/infrastructure/supertokens.ts`. Any signup side effect must either complete or compensate safely, as profile creation does by deleting a newly-created user on failure.
- CORS, SuperTokens app domains, and cookie security derive from validated config. Keep `APP_ORIGIN`, `API_DOMAIN`, and `WEBSITE_DOMAIN` consistent with the Compose ingress URL.
- `/health/live` only proves process liveness. `/health/ready` must verify the dependencies required to serve requests, currently PostgreSQL and SuperTokens Core.

# Testing and Quality Gates

- API unit tests use Jest and live beside the application code as `*.spec.ts`.
- Web tests use Vitest and live in `apps/web/src` as `*.test.ts`.
- CI runs `npm ci`, lint, format check, typecheck, tests, build, and `docker build --target production .`. Keep all of these passing for repository changes.
- Run the affected workspace test during feature work, then the root quality commands before handoff. Use Compose for behavior involving authentication, PostgreSQL, Core, nginx, redirects, or the production entrypoint.

# Out of Scope

- Do not add new deployment platforms, orchestration systems, queues, caches, or telemetry stacks without a concrete product requirement.
- Do not expose the SuperTokens Core port publicly. Development connects through the internal Compose service; production connects over loopback inside the application container.
- Do not commit secrets or replace the example development credentials with real credentials. Production requires a supplied `SUPERTOKENS_API_KEY`.
