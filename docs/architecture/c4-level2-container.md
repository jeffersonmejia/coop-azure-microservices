# C4 Level 2 — Container Diagram

```mermaid
graph TB
    subgraph "Actores"
        User["Socio /<br/>Usuario"]
    end
    
    subgraph "Azure Container Apps Environment"
        Frontend["Frontend<br/>(Angular 21)<br/>:4200"]
        AuthService["auth-service<br/>:8081"]
        AccountService["account-service<br/>:8082"]
        PaymentService["payment-service<br/>:8083"]
    end
    
    subgraph "Azure Services"
        PostgreSQL["Azure Database<br/>for PostgreSQL"]
        ACR["Azure Container<br/>Registry"]
        KeyVault["Azure Key<br/>Vault"]
        Monitor["Azure Monitor<br/>/ Log Analytics"]
    end
    
    User -->|"HTTPS"| Frontend
    Frontend -->|"REST API"| AuthService
    Frontend -->|"REST API"| AccountService
    Frontend -->|"REST API"| PaymentService
    PaymentService -->|"HTTP interna"| AccountService
    AuthService --> PostgreSQL
    AccountService --> PostgreSQL
    PaymentService --> PostgreSQL
    ACR -.->|"pull images"| AuthService
    ACR -.->|"pull images"| AccountService
    ACR -.->|"pull images"| PaymentService
    ACR -.->|"pull images"| Frontend
    KeyVault -.->|"secrets"| AuthService
    KeyVault -.->|"secrets"| AccountService
    KeyVault -.->|"secrets"| PaymentService
    Monitor -.->|"logs"| AuthService
    Monitor -.->|"logs"| AccountService
    Monitor -.->|"logs"| PaymentService
```

**Containers:**
| Container | Tecnología | Puerto | Responsabilidad |
|-----------|------------|--------|----------------|
| Frontend | Angular 21, SSR | 4200 | Web UI, routing, proxy |
| auth-service | Spring Boot | 8081 | Autenticación, JWT, usuarios |
| account-service | Spring Boot | 8082 | Cuentas, transferencias, historial |
| payment-service | Spring Boot | 8083 | Pagos, solicitudes de débito |
| PostgreSQL | Azure Database | 5432 | Almacenamiento persistente |

**Comunicación:**
- Frontend → Microservicios: REST API (HTTPS en producción)
- Microservicios → PostgreSQL: JDBC
- payment-service → account-service: HTTP (solicitud de débito)
- Todos los servicios → Key Vault: Secretos (vía Managed Identity)
