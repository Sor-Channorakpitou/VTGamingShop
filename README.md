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
