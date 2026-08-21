# C4 Level 2 — Container Diagram

```mermaid
flowchart LR
    User[Socio] --> Frontend[Angular SSR]
    Frontend --> Auth[auth-service]
    Frontend --> Account[account-service]
    Frontend --> Payment[payment-service]
    Payment --> Account
    Auth --> DB[(PostgreSQL)]
    Account --> DB
    Payment --> DB
```

- Angular SSR expone la aplicación y enruta `/api/*`.
- Los tres microservicios Spring Boot validan JWT y persisten en PostgreSQL.
- `payment-service` solicita débitos a `account-service` mediante REST.
