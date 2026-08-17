# C4 Level 1 — System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          ┌─────────────────┐                           │
│                          │                 │                           │
│                          │    Socio /      │                           │
│                          │    Usuario      │                           │
│                          │                 │                           │
│                          └────────┬────────┘                           │
│                                   │                                     │
│                                   │ HTTPS                              │
│                                   ▼                                     │
│                          ┌─────────────────┐                           │
│                          │                 │                           │
│                          │    Coop EC      │                           │
│                          │                 │                           │
│                          │  Banking App    │                           │
│                          │                 │                           │
│                          └────────┬────────┘                           │
│                                   │                                     │
│                                   │                                     │
│          ┌────────────────────────┼────────────────────────┐           │
│          │                        │                        │           │
│          ▼                        ▼                        ▼           │
│  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐      │
│  │               │      │               │      │               │      │
│  │   Microsoft   │      │   Database    │      │   External    │      │
│  │    Azure      │      │  (PostgreSQL) │      │   Services    │      │
│  │               │      │               │      │               │      │
│  └───────────────┘      └───────────────┘      └───────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Actors:**
- **Socio/Usuario:** End user accessing the banking application
- **Coop EC:** The cooperative banking system
- **Microsoft Azure:** Cloud infrastructure (Container Apps, ACR, Key Vault)
- **Database:** PostgreSQL for persistent storage
- **External Services:** Third-party integrations (future)

**Key interactions:**
- User accesses Coop EC via HTTPS
- Coop EC runs on Azure Container Apps
- Coop EC stores data in PostgreSQL
- Azure provides infrastructure, secrets, and monitoring
