# Manual QA Result — starter-project

- **Environment:** Isolated Compose projects from `compose.dev.yml` (dev, `http://localhost:18080`) and `compose.prod.yml` (prod, `http://localhost:13000`); existing services were left running. Both isolated projects were stopped after checks.
- **Verdict:** FAIL — public/API and runtime checks pass in both modes; authenticated greeting lifecycle remains unverified and the attempted token-based requests returned 401.

## Checks

- **Development public greeting** — PASS
  - Action: `GET /api/hello` after `npm run db:migrate` and `npm run db:seed` in the dev API container.
  - Expected: HTTP 200 with the DB-backed greeting.
  - Observed: HTTP 200 `{"message":"Hello world"}`.
  - Artifact: None.
- **Development auth browser routes** — PASS
  - Action: `GET /auth/` and `GET /auth/signup` through dev nginx.
  - Expected: React application shell is served for auth UI routes.
  - Observed: HTTP 200 HTML from Vite for both routes.
  - Artifact: None.
- **Development personal endpoint without a session** — PASS
  - Action: `GET /api/hello/personal`.
  - Expected: HTTP 401.
  - Observed: HTTP 401 `{"message":"unauthorised"}`.
  - Artifact: None.
- **Development health and Swagger** — PASS
  - Action: `GET /health/live`, `GET /health/ready`, and `GET /docs/` through nginx.
  - Expected: health endpoints return 200; Swagger UI is available in development.
  - Observed: both health endpoints returned HTTP 200 `{"status":"ok"}`; `/docs/` returned HTTP 200 Swagger UI HTML. The initial run used a stale nginx container; after recreating the isolated nginx with the workspace config, routes passed.
  - Artifact: None.
- **Production public greeting** — PASS
  - Action: `GET /api/hello`.
  - Expected: HTTP 200 with the DB-backed greeting.
  - Observed: HTTP 200 `{"message":"Hello world"}`.
  - Artifact: None.
- **Production auth browser routes** — PASS
  - Action: `GET /auth/` and `GET /auth/signup`.
  - Expected: React application shell is served for auth UI routes.
  - Observed: HTTP 200 static HTML for both routes after rebuilding with the updated static route configuration.
  - Artifact: None.
- **Production personal endpoint without a session** — PASS
  - Action: `GET /api/hello/personal`.
  - Expected: HTTP 401.
  - Observed: HTTP 401 `{"message":"unauthorised"}`.
  - Artifact: None.
- **Production health and Swagger absence** — PASS
  - Action: `GET /health/live`, `GET /health/ready`, and `GET /docs/`.
  - Expected: health endpoints return 200; production does not expose Swagger UI.
  - Observed: both health endpoints returned HTTP 200 `{"status":"ok"}`; `/docs/` returned HTTP 404 `Cannot GET /docs/`. After the updated Compose health dependency was applied, PostgreSQL reported healthy and the app container reported healthy with zero restarts.
  - Artifact: None.
- **Signup and authenticated lifecycle** — BLOCKED
  - Action: POSTed a new QA-only account to `/auth/signup`; then requested the personal endpoint and `/auth/signout` using the returned `st-access-token` header.
  - Expected: signup succeeds; personal greeting includes the full name and shared message; logout succeeds and later personal requests return 401.
  - Observed: signup returned HTTP 200 with `status: OK`. The token-header personal request and signout both returned HTTP 401, so personal greeting, login, and logout behavior are not verified. The in-app browser was unavailable, so the React UI flow could not be exercised.
  - Artifact: None.

## Blocking Issue

The authenticated browser lifecycle still needs a valid browser/session-based QA run. The attempted signup API call succeeded, but using its returned access token as a request header did not establish a session for the protected route or logout.
