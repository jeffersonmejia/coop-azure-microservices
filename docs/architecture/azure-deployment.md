# Azure Deployment Diagram

```mermaid
graph TB
    subgraph "Resource Group: rg-coop-dev"
        subgraph "Container Apps Environment: cae-coop-dev"
            Frontend["ca-coop-frontend-dev<br/>:4200"]
            AuthService["ca-coop-auth-dev<br/>:8081"]
            AccountService["ca-coop-account-dev<br/>:8082"]
            PaymentService["ca-coop-payment-dev<br/>:8083"]
        end
        
        ACR["acrcoopdev<br/>Container Registry"]
        PostgreSQL["psql-coop-dev<br/>PostgreSQL"]
        KeyVault["kv-coop-dev<br/>Key Vault"]
        Identity["mi-coop-dev<br/>Managed Identity"]
        Logs["law-coop-dev<br/>Log Analytics"]
    end
    
    Frontend --> AuthService
    Frontend --> AccountService
    Frontend --> PaymentService
    PaymentService -->|"HTTP interna"| AccountService
    AuthService --> PostgreSQL
    AccountService --> PostgreSQL
    PaymentService --> PostgreSQL
    ACR -->|"pull images"| AuthService
    ACR -->|"pull images"| AccountService
    ACR -->|"pull images"| PaymentService
    ACR -->|"pull images"| Frontend
    KeyVault -.->|"secrets"| AuthService
    KeyVault -.->|"secrets"| AccountService
    KeyVault -.->|"secrets"| PaymentService
    Identity -.->|"auth"| ACR
    Identity -.->|"auth"| KeyVault
    Logs -.->|"monitoring"| AuthService
    Logs -.->|"monitoring"| AccountService
    Logs -.->|"monitoring"| PaymentService
```

**Recursos:**
| Recurso | Nombre | Tipo | Acceso |
|---------|--------|------|--------|
| Resource Group | rg-coop-dev | Container | Interno |
| Container Registry | acrcoopdev | ACR | Interno (Managed Identity) |
| Container Apps Environment | cae-coop-dev | Environment | Interno |
| auth-service | ca-coop-auth-dev | Container App | Interno |
| account-service | ca-coop-account-dev | Container App | Interno |
| payment-service | ca-coop-payment-dev | Container App | Interno |
| frontend | ca-coop-frontend-dev | Container App | Público (ingress) |
| PostgreSQL | psql-coop-dev | Database | Interno |
| Key Vault | kv-coop-dev | Vault | Interno (Managed Identity) |
| Managed Identity | mi-coop-dev | Identity | System-assigned |
| Log Analytics | law-coop-dev | Monitoring | Interno |

**Flujo de imágenes:**
1. Docker build → ACR (acrcoopdev)
2. Container Apps hacen pull de ACR
3. Managed Identity autentica ACR pull

**Flujo de secretos:**
1. Key Vault almacena secretos de producción
2. Managed Identity concede acceso
3. Container Apps referencian secretos de Key Vault
