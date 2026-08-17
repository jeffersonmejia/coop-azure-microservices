# C4 Level 3 — account-service Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  account-service                                                        │
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
│  │  │  Account    │───►│  Account    │───►│  Account    │        │   │
│  │  │  Controller │    │  Service    │    │  Repository │        │   │
│  │  │             │    │             │    │             │        │   │
│  │  └─────────────┘    └──────┬──────┘    └──────┬──────┘        │   │
│  │                            │                   │               │   │
│  │                            │                   ▼               │   │
│  │                            │            ┌─────────────┐        │   │
│  │                            │            │             │        │   │
│  │                            │            │  Account    │        │   │
│  │                            │            │  Transaction│        │   │
│  │                            │            │  Repository │        │   │
│  │                            │            │             │        │   │
│  │                            │            └──────┬──────┘        │   │
│  │                            │                   │               │   │
│  │                            ▼                   ▼               │   │
│  │                     ┌─────────────┐    ┌─────────────┐        │   │
│  │                     │             │    │             │        │   │
│  │                     │  Domain     │    │  PostgreSQL │        │   │
│  │                     │  Logic      │    │  (accounts) │        │   │
│  │                     │             │    │             │        │   │
│  │                     └─────────────┘    └─────────────┘        │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Components:**
| Component | Responsibility |
|-----------|----------------|
| SecurityConfig | Spring Security, JWT validation, CurrentUser extraction |
| AccountController | REST endpoints: /me, /me/transactions, /transfer, /debit |
| AccountService | Business logic: create account, transfer, debit, history |
| AccountRepository | Data access: account CRUD |
| AccountTransactionRepository | Data access: transaction queries with pagination |
| Domain Logic | Balance validation, atomic transfers, transaction types |

**Data flow:**
1. Request → SecurityConfig (JWT filter, CurrentUser)
2. AccountController receives request
3. AccountService processes business logic
4. Domain Logic validates rules (balance, atomicity)
5. Repositories persist to PostgreSQL
