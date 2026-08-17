# Sequence Diagram — Payment Processing

```
┌──────┐    ┌─────────┐    ┌───────────────┐    ┌───────────────┐    ┌────────────┐
│ User │    │ Angular │    │payment-service│    │account-service│    │ PostgreSQL │
└──┬───┘    └────┬────┘    └──────┬────────┘    └──────┬────────┘    └─────┬──────┘
   │             │                │                     │                    │
   │  1. payment │                │                     │                    │
   │  {acct, amt,ref}            │                     │                    │
   ├────────────►│                │                     │                    │
   │             │                │                     │                    │
   │             │  2. POST       │                     │                    │
   │             │  /payments     │                     │                    │
   │             │  + JWT         │                     │                    │
   │             ├───────────────►│                     │                    │
   │             │                │                     │                    │
   │             │                │  3. JWT Filter      │                    │
   │             │                │  extract userId     │                    │
   │             │                │                     │                    │
   │             │                │  4. create payment  │                    │
   │             │                │  status: PENDING    │                    │
   │             │                │                     │                    │
   │             │                │  5. INSERT payment  │                    │
   │             │                ├─────────────────────────────────────────►│
   │             │                │                     │                    │
   │             │                │  6. debit request   │                    │
   │             │                │  POST /api/accounts/debit               │
   │             │                │  + Authorization: Bearer JWT            │
   │             │                ├────────────────────►│                    │
   │             │                │                     │                    │
   │             │                │                     │  7. validate      │
   │             │                │                     │  - account exists │
   │             │                │                     │  - sufficient bal │
   │             │                │                     │                    │
   │             │                │                     │  8. BEGIN TXN     │
   │             │                │                     │                    │
   │             │                │                     │  9. debit account │
   │             │                │                     ├───────────────────►│
   │             │                │                     │                    │
   │             │                │                     │  10. INSERT txn   │
   │             │                │                     │  type: PAYMENT    │
   │             │                │                     ├───────────────────►│
   │             │                │                     │                    │
   │             │                │                     │  11. COMMIT       │
   │             │                │                     │                    │
   │             │                │  12. debit result   │                    │
   │             │                │  {success, txnId}   │                    │
   │             │                │◄────────────────────┤                    │
   │             │                │                     │                    │
   │             │                │  13. update status  │                    │
   │             │                │  COMPLETED / FAILED │                    │
   │             │                │                     │                    │
   │             │                │  14. UPDATE payment │                    │
   │             │                ├─────────────────────────────────────────►│
   │             │                │                     │                    │
   │             │  15. result    │                     │                    │
   │             │◄───────────────┤                     │                    │
   │             │                │                     │                    │
   │  16. result │                │                     │                    │
   │◄────────────┤                │                     │                    │
   │             │                │                     │                    │
```

## Payment States

```
┌─────────┐
│ PENDING  │
└────┬────┘
     │
     ├── debit success ──► COMPLETED
     │
     └── debit failure ──► FAILED
```

## Communication Details

| Step | From → To | Protocol | Purpose |
|------|-----------|----------|---------|
| 2 | Frontend → payment-service | REST/HTTPS | Create payment |
| 5 | payment-service → PostgreSQL | JDBC | Persist payment |
| 6 | payment-service → account-service | REST/HTTP | Debit request |
| 10-11 | account-service → PostgreSQL | JDBC | Persist transaction |
| 14 | payment-service → PostgreSQL | JDBC | Update payment status |

## Debit Request Contract

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

## Error Scenarios

| Error | Payment Status | Account Status |
|-------|----------------|----------------|
| Account not found | FAILED | N/A |
| Insufficient balance | FAILED | N/A |
| Service unavailable | FAILED | N/A |
| Success | COMPLETED | DEBITED |
