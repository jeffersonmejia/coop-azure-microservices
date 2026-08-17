# Sequence Diagram — Account Transfer

```mermaid
sequenceDiagram
    actor User as Socio
    participant Angular as Frontend
    participant Account as account-service
    participant DB as PostgreSQL
    
    User->>Angular: Transferencia {to, amount}
    Angular->>Account: POST /accounts/transfer + JWT
    Account->>Account: JWT Filter, extract userId
    Account->>Account: validate (source, dest, balance)
    Account->>Account: BEGIN TRANSACTION
    Account->>DB: debit source account
    Account->>DB: credit destination account
    Account->>DB: INSERT TRANSFER_OUT
    Account->>DB: INSERT TRANSFER_IN
    Account->>Account: COMMIT
    DB-->>Account: success
    Account-->>Angular: success
    Angular-->>User: success
```

## Reglas de Validación

1. La cuenta origen debe existir y pertenecer al usuario
2. La cuenta destino debe existir
3. Las cuentas origen y destino deben ser diferentes
4. El saldo de la cuenta origen debe ser >= monto de transferencia
5. La transferencia es atómica (todo o nada)

## Tipos de Transacción Creados

- **TRANSFER_OUT:** Débito de la cuenta origen
- **TRANSFER_IN:** Crédito a la cuenta destino

## Escenarios de Error

| Error | HTTP Status | Mensaje |
|-------|-------------|---------|
| Saldo insuficiente | 422 | Saldo insuficiente |
| Misma cuenta | 400 | No se puede transferir a la misma cuenta |
| Cuenta origen no encontrada | 404 | Cuenta origen no encontrada |
| Cuenta destino no encontrada | 404 | Cuenta destino no encontrada |
