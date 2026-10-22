# Gaming Shop v2 — Microservices

Version 2 of the [Web Design Final Project](https://github.com/Sor-Channorakpitou/Web-Design_FinalProject) (kept as the legacy static site).
The same storefront, now backed by .NET microservices. Every tool used is free and open source.

## Layout

```
frontend/   the storefront (HTML, Tailwind, vanilla JS)
services/   .NET 10 microservices
deploy/     Docker Compose and, later, Kubernetes manifests
```

## Services

| Service      | Responsibility                                   | Storage            |
|--------------|--------------------------------------------------|--------------------|
| Gateway      | Single entry point, routing, JWT checks, rate limits (YARP) | —        |
| Catalog      | Products, search, stock                          | PostgreSQL, Valkey |
| Order        | Cart, orders, order saga                         | PostgreSQL         |
| Payment      | Fake payment provider (test cards only)          | PostgreSQL         |
| Notification | Order emails, sent to Mailpit                    | —                  |
| Keycloak     | Users, login, signup                             | PostgreSQL         |

## Roadmap

1. **Foundation**: Catalog service, PostgreSQL, EF Core migrations, Scalar docs, health checks. Products page loads from the API.
2. **Gateway and security**: YARP, Keycloak login themed to match the site, JWT, rate limiting.
3. **Async messaging**: Order service, Kafka with the outbox pattern, Notification service, Mailpit, Kafka UI.
4. **Sync calls and resilience**: gRPC from Order to Catalog, Polly retries and circuit breaker, Valkey cache.
5. **Saga**: reserve stock → payment → confirm, with compensation when payment fails.
6. **Observability**: OpenTelemetry → Prometheus, Grafana, Jaeger, Loki.
7. **Testing and security**: xUnit, Testcontainers, GitHub Actions, Trivy, OWASP ZAP, SonarQube Community.
8. **Kubernetes (later)**: kind, Helm, Argo CD, Traefik, k6, Chaos Mesh.

## Stack

.NET 10 LTS · YARP · Apache Kafka · PostgreSQL · Valkey · Keycloak · Mailpit · Polly · Confluent.Kafka ·
OpenTelemetry · Prometheus · Grafana · Jaeger · Loki · xUnit · Testcontainers · Trivy · OWASP ZAP · SonarQube Community

No commercially licensed libraries (MediatR, AutoMapper, MassTransit) are used.

## Requirements

- .NET 10 SDK
- Docker Desktop (or Podman Desktop / Rancher Desktop)
- About 16 GB RAM with every service running


## Running it

Everything in Docker:

```
cd deploy
docker compose up -d --build
```

Everything goes through the gateway on port 8080:

| URL                                      | What                                     |
|------------------------------------------|------------------------------------------|
| http://localhost:8080/Products.html      | Storefront                               |
| http://localhost:8080/Login.html         | Log in / sign up (Keycloak, shop theme)  |
| http://localhost:8080/auth/admin         | Keycloak admin console (`admin` / `admin`) |
| http://localhost:5101/scalar             | Catalog API docs (Scalar, direct)        |
| http://localhost:8080/health/ready       | Gateway readiness                        |

| Path          | Goes to              | Rules                                              |
|---------------|----------------------|----------------------------------------------------|
| `/api/products` GET | Catalog        | Public, rate limited (100 requests / 10 s per IP)  |
| `/api/products` POST, PUT, DELETE | Catalog | JWT with the `admin` role, rate limited     |
| `/auth/*`     | Keycloak             | Rate limited (300 / min per IP)                    |
| everything else | Storefront (nginx) | Static files                                       |

### Demo accounts (local only)

| Email                  | Password       | Roles            |
|------------------------|----------------|------------------|
| `admin@vtshop.local`   | `Admin123!`    | customer, admin  |
| `customer@vtshop.local`| `Customer123!` | customer         |

New sign-ups get the `customer` role. Keycloak locks an account for a while after 5 wrong passwords.

The realm (`deploy/keycloak/realm-vtshop.json`) is imported only when Keycloak's database is empty,
and the `keycloak` database is created only when the postgres volume is new. After changing either,
reset with `docker compose down -v` (this also wipes the catalog data, which is re-seeded on start).

### How login works

The storefront uses the authorization code flow with PKCE (`frontend/Auth.js`). "Log in" and "Sign up"
send you to Keycloak's login page, themed to look like the shop (`deploy/keycloak/themes/vtshop`).
Keycloak sends you back to `Callback.html`, which exchanges the code for tokens. API calls carry the
access token; the gateway checks it, and Catalog checks it again before any admin action.

Access tokens are issued by `http://localhost:8080/auth/realms/vtshop`, have the audience `vtshop-api`
and list the user's realm roles in a `roles` claim.

To try the admin endpoints in Scalar, log in as the admin, then copy the access token from the browser
(DevTools → Application → Session storage → `vt.auth.tokens` → `accessToken`).

### Running pieces outside Docker

Run a service from your IDE with the rest in Docker, e.g. `docker compose up -d postgres keycloak` and
`dotnet run --project services/Catalog/Catalog.Api`. The storefront can be opened with VS Code Live Server
(port 5500); `frontend/Api.js` then sends requests to the gateway on port 8080.

### Tests and migrations

```
dotnet test
dotnet tool restore
dotnet ef migrations add <Name> -p services/Catalog/Catalog.Api -o Data/Migrations
```
