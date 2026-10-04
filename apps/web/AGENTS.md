```yaml
name: web
```

# Web Application Guidance

## Tech Stack

- React 19 with the `react-jsx` transform and TypeScript strict mode.
- Vite 6 is the development server and production asset builder.
- Tailwind CSS v4 is loaded through `@tailwindcss/vite`; its tokens and source registration live in `src/styles/theme.css`.
- SuperTokens React provides EmailPassword and Session recipes plus the prebuilt auth UI.
- React Router is available for browser routing. Vitest is the web test runner.
- `@starter/shared` is the only package for API transport contracts shared with the backend.

## Architecture and Key Layers

- `src/main.tsx` is the composition root. It initializes SuperTokens once, wraps the rendered tree in `SuperTokensWrapper`, chooses prebuilt auth routes with `canHandleRoute`/`getRoutingComponent`, and renders the application for every other route.
- Use the feature layout exactly: put route-level screens in `src/features/<feature>/pages`, feature-specific business/presentation components in `src/features/<feature>/components`, and browser request adapters in `src/features/<feature>/api`. Put reusable, domain-neutral controls such as buttons and navigation in `src/components/ui`.
- Keep global Tailwind imports, semantic tokens, and base document styles in `src/styles/theme.css`. Do not scatter a second design-token system through components or add a Tailwind JavaScript config without a compatibility requirement.
- Use functional programming at the browser boundary: React function components, pure helpers, immutable API/view data, and immutable state updates. Server-side API modules own authorization, data access, validation, and domain decisions.
- Use relative browser requests such as `/api/...` and `/auth/...`. The ingress maps these paths to the API while keeping the browser on one origin.

## Must-Follow Conventions

- Every React component requires its own PascalCase `.tsx` file; do not place multiple components in one component file. Name hooks `useCamelCase.ts`, pure helpers `camelCase.ts`, and expose a feature's public surface through `index.ts` barrel exports.
- Keep components as pure render functions of props and local UI state. Copy arrays/objects before changing them; never mutate props, API responses, or existing state values.
- Define API response types in `packages/shared/src/index.ts` and import them by package name. Do not copy transport shapes into this app; local UI-only state types are allowed.
- Treat every response as untrusted at the UI boundary: show a safe, user-readable failure state for non-OK responses and avoid rendering server error text directly.
- Send authenticated API requests with `credentials: 'include'`. On a 401 from a protected user action, redirect to `/auth`; do not build client-managed token storage.
- Configure SuperTokens with the current browser origin and `/auth` for both API and website base paths. Keep its EmailPassword signup fields aligned with the backend recipe; `fullName` is currently required by both.
- Keep Vite's allowed hosts limited to the local browser host and the Compose `web` service name. Add a host only when it is an intentional development ingress.
- Preserve React `StrictMode`, TypeScript strictness, and `noEmit` browser compilation.

## Forbidden Patterns / Anti-Patterns

- Do not call PostgreSQL, SuperTokens Core, or any internal Compose hostname from browser code.
- Do not accept, persist, or derive the current identity from a client-supplied user ID, full name, token, or query parameter. Session cookies and the API determine identity.
- Do not expose SuperTokens Core's port, its API key, database URLs, or other secrets to Vite client code.
- Do not use absolute API origins in components. They break same-origin cookies and the development/production ingress contract.
- Do not replace SuperTokens login, signup, session-refresh, or logout behavior with custom password or token code.
- Do not add Redux, MobX, Zustand, XState, or another client-side business-state machine. The browser may hold SDK session state, route navigation, and local request/loading/error state only; product rules and business state transitions belong to the API.
- Do not send `/api`, `/auth`, `/health`, or `/docs` requests to the SPA fallback. Those are server-owned paths.

## Tooling and Dependency Management

- This app is the `@starter/web` npm workspace. Install dependencies from the repository root with `npm ci`; use npm workspaces rather than a second lockfile or package manager.
- Add runtime packages to `apps/web/package.json` and development-only tools to its `devDependencies`. Keep versions compatible with the root lockfile.
- Use the root ESLint flat configuration and Prettier configuration. Do not add app-local lint or formatting tools without a demonstrated requirement.
- Vite configuration belongs in `vite.config.ts`; browser TypeScript configuration belongs in `tsconfig.json`.

## How to Run Locally

- Install dependencies: `npm ci` from the repository root.
- Start only the Vite server: `npm run dev:web`. It listens on `0.0.0.0:5173`; use it for presentation work that does not require API or auth behavior.
- Start the integrated development environment: `docker compose --env-file .env.example -f compose.dev.yml up --build`. Browse through nginx at `http://localhost:8080`; do not browse the Vite container directly when checking API/auth behavior.
- Development Compose provides `web` (Vite), `nginx` (the only published web ingress, `8080:80`), `api` (Nest on the internal network), `supertokens`, and `pg`. Nginx sends `/api/`, `/health/`, and `/docs/` to the API; it sends `/auth/` GET/HEAD to Vite and auth mutations to the API.
- Use the development configuration values in `.env.example` or an uncommitted `.env`. `APP_ORIGIN`, `API_DOMAIN`, and `WEBSITE_DOMAIN` must all describe `http://localhost:8080` for this Compose setup.

## How to Test

- Run web unit tests: `npm run test --workspace=@starter/web`.
- Run web type checks: `npm run typecheck --workspace=@starter/web`.
- Build production web assets: `npm run build --workspace=@starter/web`.
- Put focused Vitest tests in `src` as `*.test.ts`. Test observable UI helpers and rendering behavior; use Compose behavior checks for cookie sessions, SuperTokens routing, nginx routing, and API integration.
- Before handing off a web change, run the affected workspace test and type check. Run the root quality commands when the change affects shared contracts, configuration, container behavior, or repository-wide tooling.

## Configuration Approach

- The current browser configuration is derived from `window.location.origin`, so a browser-facing `.env` value is unnecessary for API/auth origin selection.
- Backend runtime configuration is validated by the API. Keep browser assumptions synchronized with its `APP_ORIGIN`, `API_DOMAIN`, and `WEBSITE_DOMAIN` values and the ingress port.
- Never place secrets in `VITE_*` variables, source files, HTML, committed `.env` files, or browser logs. `SUPERTOKENS_API_KEY` is server-only.
- Keep `apiBasePath` and `websiteBasePath` as `/auth` unless backend middleware and nginx/static routing are changed together.

## External Services

- The API exposes public `/api/hello` and session-protected `/api/hello/personal` endpoints. The protected request must include browser credentials.
- SuperTokens React communicates with the API under `/auth`; the API communicates privately with SuperTokens Core. The web app must never connect to Core itself.
- PostgreSQL is reached only by the API and SuperTokens Core. This app has no database client.

## Deployment and Runtime Expectations

- The repository `Dockerfile` has a `development` Node 22.14.0 Bookworm Slim stage used by the Vite Compose service, and a build stage that produces `apps/web/dist`.
- The production image is based on the pinned SuperTokens PostgreSQL image, copies the compiled web assets to the API runtime, and exposes only application HTTP on port 3000. Production Compose publishes `3000:3000`; Vite is not present there.
- Production serves built browser assets through Nest's static delivery and must render the app shell for browser routes, including `/auth`, while preserving server ownership of `/api`, `/auth` mutations, `/health`, and Swagger paths.
- Production Compose requires `pg` and `app`. The application health check uses `GET /health/ready`; browser work must not depend on a production Vite server or a public Core port.

## Testing and Quality Gates

- Repository CI runs `npm ci`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`, and `docker build --target production .`.
- Keep `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, and `npm run build` passing before handoff when web code changes.
- Verify any change to auth UI, cookie requests, ingress routing, or static fallback through both Compose modes: `compose.dev.yml` at port 8080 and `compose.prod.yml` at port 3000.

## Common Mistakes to Avoid

- Testing `http://localhost:5173` and concluding that cookie/auth behavior works. Use nginx at port 8080 in development.
- Changing a `/auth` request from GET/HEAD to a mutation assumption: nginx intentionally sends pages to Vite and form/session mutations to Nest.
- Removing `allowedHosts: ['localhost', 'web']` or omitting `web`: Vite rejects the Compose upstream Host header.
- Redirecting a 401 to an external domain, which loses the same-origin session flow.
- Adding duplicate full-name validation only in a component and allowing a backend/UI field mismatch. The server remains the authoritative validator.
- Using a public API response as proof of session state. Exercise `/api/hello/personal` after a real signup/login through the ingress.
