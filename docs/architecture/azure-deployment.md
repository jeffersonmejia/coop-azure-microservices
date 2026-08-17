# Azure Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Resource Group: rg-coop-dev                                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │  Container Apps Environment: cae-coop-dev                      │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │                                                         │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │   │
│  │  │  │             │  │             │  │             │    │   │   │
│  │  │  │ ca-coop-    │  │ ca-coop-    │  │ ca-coop-    │    │   │   │
│  │  │  │ auth-dev    │  │ account-dev │  │ payment-dev │    │   │   │
│  │  │  │             │  │             │  │             │    │   │   │
│  │  │  │ :8081       │  │ :8082       │  │ :8083       │    │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │   │
│  │  │                                                         │   │   │
│  │  │  ┌─────────────┐                                       │   │   │
│  │  │  │             │                                       │   │   │
│  │  │  │ ca-coop-    │                                       │   │   │
│  │  │  │ frontend-dev│                                       │   │   │
│  │  │  │             │                                       │   │   │
│  │  │  │ :4200       │                                       │   │   │
│  │  │  └─────────────┘                                       │   │   │
│  │  │                                                         │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │                  │  │                  │  │                  │     │
│  │  acrcoopdev      │  │  psql-coop-dev   │  │  kv-coop-dev     │     │
│  │                  │  │                  │  │                  │     │
│  │  Container       │  │  PostgreSQL      │  │  Key Vault       │     │
│  │  Registry        │  │  Database        │  │  (secrets)       │     │
│  │                  │  │                  │  │                  │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐                           │
│  │                  │  │                  │                           │
│  │  Managed         │  │  Log Analytics   │                           │
│  │  Identity        │  │  Workspace       │                           │
│  │                  │  │                  │                           │
│  └──────────────────┘  └──────────────────┘                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Resources:**
| Resource | Name | Type | Access |
|----------|------|------|--------|
| Resource Group | rg-coop-dev | Container | Internal |
| Container Registry | acrcoopdev | ACR | Internal (Managed Identity) |
| Container Apps Environment | cae-coop-dev | Environment | Internal |
| auth-service | ca-coop-auth-dev | Container App | Internal |
| account-service | ca-coop-account-dev | Container App | Internal |
| payment-service | ca-coop-payment-dev | Container App | Internal |
| frontend | ca-coop-frontend-dev | Container App | Public (ingress) |
| PostgreSQL | psql-coop-dev | Database | Internal |
| Key Vault | kv-coop-dev | Vault | Internal (Managed Identity) |
| Managed Identity | mi-coop-dev | Identity | System-assigned |
| Log Analytics | law-coop-dev | Monitoring | Internal |

**Image flow:**
1. Docker build → ACR (acrcoopdev)
2. Container Apps pull from ACR
3. Managed Identity authenticates ACR pull

**Secret flow:**
1. Key Vault stores production secrets
2. Managed Identity grants access
3. Container Apps reference Key Vault secrets
