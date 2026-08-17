# Sequence Diagram — Payment Processing

```mermaid
sequenceDiagram
    actor User as Socio
    participant Angular as Frontend
    participant Payment as payment-service
    participant Account as account-service
    participant DB as PostgreSQL
    
    User->>Angular: Pago {account, amount, reference}
    Angular->>Payment: POST /payments + JWT
    Payment->>Payment: JWT Filter, extract userId
    Payment->>Payment: create payment (PENDING)
    Payment->>DB: INSERT payment
    Payment->>Account: POST /api/accounts/debit + Authorization: Bearer JWT
    Account->>Account: validate (account, balance)
    Account->>Account: BEGIN TRANSACTION
    Account->>DB: debit account
    Account->>DB: INSERT PAYMENT transaction
    Account->>Account: COMMIT
    DB-->>Account: success
    Account-->>Payment: debit result {success, transactionId}
    Payment->>Payment: update status (COMPLETED/FAILED)
    Payment->>DB: UPDATE payment
    Payment-->>Angular: result
    Angular-->>User: result
```

## Estados de Pago

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> COMPLETED: débito exitoso
    PENDING --> FAILED: débito fallido
    COMPLETED --> [*]
    FAILED --> [*]
```

## Detalles de Comunicación

| Paso | De → A | Protocolo | Propósito |
|------|--------|-----------|-----------|
| 2 | Frontend → payment-service | REST/HTTPS | Crear pago |
| 5 | payment-service → PostgreSQL | JDBC | Persistir pago |
| 6 | payment-service → account-service | REST/HTTP | Solicitud de débito |
| 10-11 | account-service → PostgreSQL | JDBC | Persistir transacción |
| 14 | payment-service → PostgreSQL | JDBC | Actualizar estado del pago |

## Contrato de Solicitud de Débito

**Request:**
```json
POST /api/accounts/debit
{
  "accountNumber": "string",
  "amount": "number",
  "reference": "string"
}
```

**Response:**
```json
{
  "success": "boolean",
  "message": "string",
  "transactionId": "number"
}
```

## Escenarios de Error

| Error | Payment Status | Account Status |
|-------|----------------|----------------|
| Cuenta no encontrada | FAILED | N/A |
| Saldo insuficiente | FAILED | N/A |
| Servicio no disponible | FAILED | N/A |
| Éxito | COMPLETED | DEBITED |
