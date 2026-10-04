```yaml
name: api
```

# API Context

## Tech Stack

- NestJS 11 with Express, TypeScript in strict mode, and CommonJS output.
- Drizzle ORM with `pg` against PostgreSQL.
- SuperTokens Node and SuperTokens Core for EmailPassword authentication and sessions.
- Zod for startup configuration; class-validator/class-transformer through Nest's global validation pipe.
- Jest with ts-jest for API unit tests. `@starter/shared` owns public response contracts.

## Architecture and Key Layers

- Use **Hexagonal Architecture** (also called **ports and adapters**) inside every feature module. Domain and application layers define the behavior and port contracts; HTTP, Drizzle, and SuperTokens integrations are replaceable adapters at the boundary.
- Add product code under `src/modules/<feature>/`. A feature may contain `domain`, `application`, `ports`, and `adapters` directories.
- Put domain value types and errors in `domain/`; they must not import Nest, Drizzle, Express, or SuperTokens.
- Put use-case orchestration in `application/`. Facades are injectable application services and depend on port tokens, other facades, and domain types.
- Define persistence contracts and injection symbols in `ports/`. Keep each port independent of Drizzle types.
- Put HTTP controllers and Drizzle repositories in `adapters/`. Controllers call facades and translate the HTTP boundary only; repositories implement ports.
- Register a feature's providers/controllers in `<feature>.module.ts` and export only capabilities consumed by another module.
- Treat each feature's `index.ts` as its **public barrel export**. Export the Nest module, public facade, and public types/tokens there; cross-module imports must use that barrel and must never reach an internal controller, repository, schema, port implementation, or domain service.
- Add Drizzle tables as `src/modules/<feature>/adapters/*.schema.ts`. `drizzle.config.ts` discovers only that glob.
- Keep process-wide infrastructure in `src/infrastructure/`: configuration, database construction, SuperTokens initialization, migrations, and seed data.

## Must-Follow Conventions

- Use `PascalCase` for classes, `camelCase` for values and methods, `kebab-case` for files, and `*.schema.ts` only for Drizzle schemas.
- Add externally returned API types to `packages/shared/src/index.ts`; import them as `@starter/shared`. Do not recreate transport interfaces in controllers or the browser client.
- Read environment values only through `readConfig()` in `src/infrastructure/config.ts`. Extend its Zod schema and `.env.example` together when adding configuration.
- Preserve the global `ValidationPipe({ transform: true, whitelist: true })` in `main.ts`; define DTOs for new untrusted controller input.
- Protect user-specific endpoints with `SessionGuard`; obtain identity only from `request.session.getUserId()`. Never accept a user id from the browser as an authorization source.
- Initialize SuperTokens once in `initializeSuperTokens()`, before Express auth middleware is mounted. Keep its `/auth` API base path aligned with the web client and ingress.
- Signup side effects must be all-or-compensated. The EmailPassword signup override creates a profile after Core creates a user and deletes that Core user if profile creation fails.
- Preserve safe dependency failures: the public greeting returns 503 if its record is missing, and readiness returns 503 when PostgreSQL or SuperTokens Core is unavailable.
- Generate migrations with `npm run db:generate`; do not edit generated files in `drizzle/` by hand. Apply them with `npm run db:migrate` and make seed inserts idempotent.

## Forbidden Patterns / Anti-Patterns

- Do not import Drizzle, `pg`, Express, or SuperTokens into domain code or port definitions.
- Do not query a table directly from a controller or facade when a repository port owns that data boundary.
- Do not bypass `SessionGuard`, trust a request header/body user id, or expose SuperTokens Core to the browser.
- Do not read `process.env` in modules, controllers, repositories, or startup scripts outside the central configuration module.
- Do not disable CORS credentials, weaken validation whitelisting, log auth secrets/session tokens, or return raw database/Core errors to clients.
- Do not replace the production startup order: migrations and seed run before Core and the API.

## Tooling and Dependency Management

Run commands from the repository root. The repository uses npm workspaces; install the locked dependency graph with `npm ci`.

| Purpose               | Command                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Run API in watch mode | `npm run dev:api`                                                                        |
| Build API             | `npm run build --workspace=@starter/api`                                                 |
| API type check        | `npm run typecheck --workspace=@starter/api`                                             |
| API unit tests        | `npm run test --workspace=@starter/api`                                                  |
| Generate migration    | `npm run db:generate`                                                                    |
| Apply migration       | `npm run db:migrate`                                                                     |
| Seed greeting data    | `npm run db:seed`                                                                        |
| Full quality gates    | `npm run lint && npm run format:check && npm run typecheck && npm test && npm run build` |

Use the existing Nest, Drizzle, SuperTokens, Zod, and Jest packages. Add a dependency only when the established stack cannot provide the required behavior.

## How to Run Locally

- Copy or supply values based on `.env.example`. The API requires `DATABASE_URL`, `SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY`, `APP_ORIGIN`, `API_DOMAIN`, and `WEBSITE_DOMAIN`; `PORT` defaults to `3000`.
- For the complete development environment, run `docker compose --env-file .env.example -f compose.dev.yml up --build`. It exposes nginx at `http://localhost:8080`; nginx routes API, health, docs, and auth mutations to the API, while auth GET/HEAD requests and other browser routes go to Vite.
- The direct API dev command requires reachable PostgreSQL and SuperTokens Core matching `DATABASE_URL` and `SUPERTOKENS_CONNECTION_URI`.
- Development Swagger is available at `/docs`. It is intentionally not configured in production.

## How to Test

- Keep unit tests next to API application code as `*.spec.ts`; Jest discovers tests beneath `src`.
- Run the focused workspace test for changed behavior. Use Compose for flows requiring cookies, SuperTokens Core, PostgreSQL, nginx routing, redirects, or startup sequencing.
- Before handoff, run the root quality-gate command above. CI also builds the production Docker target using `docker build --target production .`.

## Configuration Approach

- `src/infrastructure/config.ts` is the authoritative schema. It validates URL values and requires a SuperTokens API key of at least 16 characters.
- `NODE_ENV` is `development`, `test`, or `production`; session cookies are secure only in production. `PORT` defaults to `3000`.
- `APP_ORIGIN` configures credentialed CORS. `API_DOMAIN` and `WEBSITE_DOMAIN` configure SuperTokens; keep all three consistent with the browser ingress URL.
- Store credentials outside source control. `.env.example` contains development-only values and documents required variables.

## External Services

- PostgreSQL holds application tables `hello_messages` and `user_profiles`. The `DATABASE` Nest provider owns the shared Drizzle database and pg pool.
- SuperTokens Core owns credentials and sessions. In development it runs as the private `supertokens` Compose service at port 3567; the API uses its configured internal URI and API key.
- `/health/live` checks only process liveness. `/health/ready` checks PostgreSQL with `select 1` and Core through its `/hello` endpoint.
- No cache, queue, or third-party API is configured. Do not introduce one without a concrete requirement.

## Deployment and Runtime Expectations

- Root `Dockerfile` defines `development`, `build`, and `production` stages. Development and build use `node:22.14.0-bookworm-slim`; production starts from `registry.supertokens.io/supertokens/supertokens-postgresql:10.1.1` and adds the Node runtime and compiled API/web artifacts.
- `compose.prod.yml` runs PostgreSQL (`postgres:17.4-alpine`) and one `app` container. The app starts migrations and seed data, then starts SuperTokens Core and Nest together via `docker/start-production.sh`.
- Core binds only to `127.0.0.1:3567` within the production app container. Do not publish its port. The app publishes `3000`; PostgreSQL is private.
- Production Compose waits for PostgreSQL health before starting the app. The app healthcheck calls `GET /health/ready` on port 3000. The production container runs as the `supertokens` user.
- Static production web files are served from `apps/web/dist` by Nest. Preserve API exclusions for `/api/*`, `/health/*`, and `/docs/*`; `/auth/*` GET/HEAD renders the React auth UI while mutations remain SuperTokens middleware requests.

## Testing and Quality Gates

- Required repository checks are lint, Prettier format check, typecheck, Jest/Vitest tests, workspace build, and production Docker build.
- CI runs `npm ci`, each root quality command, then `docker build --target production .` on pushes and pull requests.
- A change involving database schema, authentication, ingress routing, readiness, or production entrypoint needs a Compose-based verification in addition to unit tests.

## Common Mistakes to Avoid

- Forgetting to build `@starter/shared` before importing its emitted contract types; root `typecheck` and `build` enforce the order.
- Adding a schema outside `adapters` or without the `.schema.ts` suffix, so Drizzle does not discover it.
- Changing a database schema without generating and applying a migration, or adding a non-idempotent seed action.
- Changing the public ingress port without updating `APP_ORIGIN`, `API_DOMAIN`, and `WEBSITE_DOMAIN` together.
- Routing all `/auth/*` traffic to the web app; only GET and HEAD belong there, while auth mutations must reach Nest/SuperTokens.
- Treating `/health/live` as dependency readiness, or exposing Core's port to satisfy a health check.
