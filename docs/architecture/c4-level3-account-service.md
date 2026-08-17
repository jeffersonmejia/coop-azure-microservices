# C4 Level 3 — account-service Components

```mermaid
graph TB
    subgraph "account-service"
        SecurityConfig["Security<br/>Config"]
        AccountController["Account<br/>Controller"]
        AccountService["Account<br/>Service"]
        AccountRepository["Account<br/>Repository"]
        TransactionRepository["AccountTransaction<br/>Repository"]
        DomainLogic["Domain<br/>Logic"]
        PostgreSQL[("PostgreSQL<br/>(accounts)")]
    end
    
    SecurityConfig --> AccountController
    AccountController --> AccountService
    AccountService --> AccountRepository
    AccountService --> TransactionRepository
    AccountService --> DomainLogic
    AccountRepository --> PostgreSQL
    TransactionRepository --> PostgreSQL
```

**Componentes:**
| Componente | Responsabilidad |
|------------|-----------------|
| SecurityConfig | Spring Security, validación JWT, extracción de CurrentUser |
| AccountController | REST endpoints: /me, /me/transactions, /transfer, /debit |
| AccountService | Lógica de negocio: crear cuenta, transferir, débito, historial |
| AccountRepository | Acceso a datos: CRUD de cuentas |
| AccountTransactionRepository | Acceso a datos: queries de transacciones con paginación |
| Domain Logic | Validación de saldo, transferencias atómicas, tipos de transacción |

**Flujo de datos:**
1. Request → SecurityConfig (JWT filter, CurrentUser)
2. AccountController recibe request
3. AccountService procesa lógica de negocio
4. Domain Logic valida reglas (saldo, atomicidad)
5. Repositories persisten en PostgreSQL
