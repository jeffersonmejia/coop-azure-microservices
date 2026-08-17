# C4 Level 3 — payment-service Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  payment-service                                                        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │  ┌─────────────┐                                               │   │
│  │  │             │                                               │   │
│  │  │  Security   │──── JWT Filter                                │   │
│  │  │  Config     │                                               │   │
│  │  │             │                                               │   │
│  │  └──────┬──────┘                                               │   │
│  │         │                                                       │   │
│  │         ▼                                                       │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │   │
│  │  │             │    │             │    │             │        │   │
│  │  │  Payment    │───►│  Payment    │───►│  Payment    │        │   │
│  │  │  Controller │    │  Service    │    │  Repository │        │   │
│  │  │             │    │             │    │             │        │   │
│  │  └─────────────┘    └──────┬──────┘    └──────┬──────┘        │   │
│  │                            │                   │               │   │
│  │                            │                   ▼               │   │
│  │                            │            ┌─────────────┐        │   │
│  │                            │            │             │        │   │
│  │                            │            │  Payment    │        │   │
│  │                            │            │  Domain     │        │   │
│  │                            │            │             │        │   │
│  │                            │            └─────────────┘        │   │
│  │                            │                                   │   │
│  │                            ▼                                   │   │
│  │                     ┌─────────────┐                            │   │
│  │                     │             │                            │   │
│  │                     │  Account    │──── HTTP ────► account-    │   │
│  │                     │  Service    │              service       │   │
│  │                     │  Client     │                            │   │
│  │                     │             │                            │   │
│  │                     └─────────────┘                            │   │
│  │                                                                 │   │
│  │                     ┌─────────────┐                            │   │
│  │                     │             │                            │   │
│  │                     │  PostgreSQL │                            │   │
│  │                     │  (payments) │                            │   │
│  │                     │             │                            │   │
│  │                     └─────────────┘                            │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Components:**
| Component | Responsibility |
|-----------|----------------|
| SecurityConfig | Spring Security, JWT validation, CurrentUser extraction |
| PaymentController | REST endpoints: POST /payments, GET /payments/{id}, GET /payments |
| PaymentService | Business logic: create payment, request debit, update status |
| PaymentRepository | Data access: payment CRUD |
| Payment Domain | Status management (PENDING → COMPLETED/FAILED) |
| AccountServiceClient | HTTP client to account-service for debit requests |

**Data flow:**
1. Request → SecurityConfig (JWT filter, CurrentUser)
2. PaymentController receives request
3. PaymentService creates payment (PENDING)
4. AccountServiceClient sends debit request to account-service
5. PaymentService updates status (COMPLETED/FAILED)
6. PaymentRepository persists to PostgreSQL
