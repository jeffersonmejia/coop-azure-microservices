# C4 Level 2 — Container Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          ┌─────────────────┐                           │
│                          │    Socio /      │                           │
│                          │    Usuario      │                           │
│                          └────────┬────────┘                           │
│                                   │                                     │
│                                   │ HTTPS                              │
│                                   ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Azure Container Apps Environment              │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────────────────────────────────────┐    │  │
│  │  │                                                         │    │  │
│  │  │                    Frontend                             │    │  │
│  │  │                    (Angular 21)                         │    │  │
│  │  │                    Port: 4200                           │    │  │
│  │  │                                                         │    │  │
│  │  └─────────────────────────┬───────────────────────────────┘    │  │
│  │                            │                                     │  │
│  │                            │ REST API                            │  │
│  │                            ▼                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │  │
│  │  │              │  │              │  │              │          │  │
│  │  │ auth-service │  │account-      │  │payment-      │          │  │
│  │  │              │  │service       │  │service       │          │  │
│  │  │ Port: 8081   │  │              │  │              │          │  │
│  │  │              │  │ Port: 8082   │  │ Port: 8083   │          │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │  │
│  │         │                  │                  │                   │  │
│  │         │                  │                  │                   │  │
│  └─────────┼──────────────────┼──────────────────┼───────────────────┘  │
│            │                  │                  │                       │
│            │                  │                  │                       │
│            ▼                  ▼                  ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │                    Azure Database for PostgreSQL                 │  │
│  │                                                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                │  │
│  │  │   auth     │  │  accounts  │  │  payments  │                │  │
│  │  │   schema   │  │   schema   │  │   schema   │                │  │
│  │  └────────────┘  └────────────┘  └────────────┘                │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │              │  │              │  │              │                 │
│  │  Azure       │  │  Azure Key   │  │  Azure       │                 │
│  │  Container   │  │  Vault       │  │  Monitor     │                 │
│  │  Registry    │  │              │  │              │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Containers:**
| Container | Technology | Port | Responsibility |
|-----------|------------|------|----------------|
| Frontend | Angular 21, SSR | 4200 | Web UI, routing, proxy |
| auth-service | Spring Boot | 8081 | Authentication, JWT, users |
| account-service | Spring Boot | 8082 | Accounts, transfers, history |
| payment-service | Spring Boot | 8083 | Payments, debit requests |
| PostgreSQL | Azure Database | 5432 | Persistent storage |

**Communication:**
- Frontend → Microservices: REST API (HTTPS in production)
- Microservices → PostgreSQL: JDBC
- payment-service → account-service: HTTP (debit request)
- All services → Key Vault: Secrets (via Managed Identity)
