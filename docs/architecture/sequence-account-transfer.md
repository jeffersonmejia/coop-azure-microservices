# Sequence Diagram — Account Transfer

```
┌──────┐    ┌─────────┐    ┌───────────────┐    ┌────────────┐
│ User │    │ Angular │    │account-service│    │ PostgreSQL │
└──┬───┘    └────┬────┘    └──────┬────────┘    └─────┬──────┘
   │             │                │                    │
   │  1. transfer│                │                    │
   │  {to, amt}  │                │                    │
   ├────────────►│                │                    │
   │             │                │                    │
   │             │  2. POST       │                    │
   │             │  /accounts/transfer                 │
   │             │  + JWT         │                    │
   │             ├───────────────►│                    │
   │             │                │                    │
   │             │                │  3. JWT Filter     │
   │             │                │  extract userId    │
   │             │                │                    │
   │             │                │  4. validate       │
   │             │                │  - source exists   │
   │             │                │  - dest exists     │
   │             │                │  - sufficient bal  │
   │             │                │  - different accnt │
   │             │                │                    │
   │             │                │  5. BEGIN TXN      │
   │             │                │                    │
   │             │                │  6. debit source   │
   │             │                │  UPDATE balance    │
   │             │                ├───────────────────►│
   │             │                │                    │
   │             │                │  7. credit dest    │
   │             │                │  UPDATE balance    │
   │             │                ├───────────────────►│
   │             │                │                    │
   │             │                │  8. INSERT txn     │
   │             │                │  (TRANSFER_OUT)    │
   │             │                ├───────────────────►│
   │             │                │                    │
   │             │                │  9. INSERT txn     │
   │             │                │  (TRANSFER_IN)     │
   │             │                ├───────────────────►│
   │             │                │                    │
   │             │                │  10. COMMIT        │
   │             │                │                    │
   │             │  11. success   │                    │
   │             │◄───────────────┤                    │
   │             │                │                    │
   │  12. success│                │                    │
   │◄────────────┤                │                    │
   │             │                │                    │
```

## Transfer Validation Rules

1. Source account must exist and belong to user
2. Destination account must exist
3. Source and destination must be different accounts
4. Source balance must be >= transfer amount
5. Transfer is atomic (all or nothing)

## Transaction Types Created

- **TRANSFER_OUT:** Debit from source account
- **TRANSFER_IN:** Credit to destination account

## Error Scenarios

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Insufficient balance | 422 | Saldo insuficiente |
| Same account | 400 | No se puede transferir a la misma cuenta |
| Account not found | 404 | Cuenta origen no encontrada |
| Destination not found | 404 | Cuenta destino no encontrada |
