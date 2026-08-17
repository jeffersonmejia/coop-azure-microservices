# Volume Test Checklist - Coop EC

## Date: ____________
## Dataset Size: ____________
## Environment: ____________

---

## 1. Import Validation

- [ ] Import completed without errors
- [ ] Users count matches expected (~5,369)
- [ ] Accounts count matches expected (~4,500)
- [ ] Transactions count matches expected (~1,056,320)
- [ ] Payments count matches expected (~6,471)
- [ ] No duplicate records generated

## 2. Referential Integrity

- [ ] All accounts have valid user references
- [ ] All account_members have valid account references
- [ ] All account_members have valid user references
- [ ] All transactions have valid source_account_id (or NULL)
- [ ] All transactions have valid destination_account_id (or NULL)
- [ ] No orphan records in any table

## 3. Pagination

- [ ] Page 0 returns correct results
- [ ] Page 1 returns correct offset
- [ ] Page 50 returns correct offset
- [ ] Page 100 returns correct offset
- [ ] Page size 20 works correctly
- [ ] Empty page returns empty result
- [ ] Last page returns partial results

## 4. Sorting

- [ ] Sort by date DESC works
- [ ] Sort by date ASC works
- [ ] Sort by amount DESC works
- [ ] Sort by amount ASC works
- [ ] Composite sort (date + type) works

## 5. Filtering

- [ ] Filter by type (DEPOSIT, WITHDRAWAL, etc.)
- [ ] Filter by status (COMPLETED, PENDING, FAILED)
- [ ] Filter by date range
- [ ] Filter by account_id
- [ ] Filter by reference
- [ ] Combined filters work correctly

## 6. Index Usage

- [ ] idx_transactions_account_date used for history queries
- [ ] idx_transactions_type used for type filtering
- [ ] idx_transactions_status used for status filtering
- [ ] idx_transactions_occurred used for date range queries
- [ ] No sequential scans on large tables for common queries

## 7. Performance

- [ ] History query (20 rows) completes in < 100ms
- [ ] Type filter query completes in < 50ms
- [ ] Date range query completes in < 100ms
- [ ] Pagination query completes in < 50ms
- [ ] No query exceeds 1s

## 8. Memory

- [ ] No full table scans in memory
- [ ] Transactions table size is reasonable
- [ ] Index sizes are reasonable
- [ ] No OutOfMemory errors during queries

## 9. Service Startup

- [ ] auth-service starts without loading dataset
- [ ] account-service starts without loading dataset
- [ ] payment-service starts without loading dataset
- [ ] Startup time unaffected by dataset size

## 10. Data Integrity

- [ ] Transaction amounts are positive
- [ ] Transaction dates are within valid range
- [ ] Account balances are consistent
- [ ] No negative balances (unless allowed)
- [ ] Reference fields are properly formatted

---

## Results

| Check | Status | Notes |
|-------|--------|-------|
| Import | | |
| Integrity | | |
| Pagination | | |
| Sorting | | |
| Filtering | | |
| Indexes | | |
| Performance | | |
| Memory | | |
| Startup | | |
| Data Integrity | | |

## Conclusion

- [ ] All checks passed
- [ ] Some checks failed (document below)

### Failed Checks

_Add details for any failed checks_

---

## Sign-off

- [ ] Volume test completed
- [ ] Results documented
- [ ] Issues registered in checked.md
