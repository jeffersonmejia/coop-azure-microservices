#!/bin/bash
set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-coop}"
DB_USER="${DB_USER:-coop}"
DB_PASSWORD="${DB_PASSWORD:-coop}"

export PGPASSWORD="$DB_PASSWORD"
PSQL="psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -t -A"

echo "============================================"
echo "  Volume Test Report - Coop EC"
echo "============================================"
echo ""
echo "Date: $(date)"
echo ""

PASS=0
FAIL=0

check() {
    local desc="$1"
    local result="$2"
    if [[ "$result" == "PASS" ]]; then
        echo "[PASS] $desc"
        ((PASS++))
    else
        echo "[FAIL] $desc - $result"
        ((FAIL++))
    fi
}

# ============================================
# 1. Row Counts
# ============================================
echo "=== 1. Row Counts ==="
echo ""

USERS=$($PSQL -c "SELECT COUNT(*) FROM auth.users;")
ACCOUNTS=$($PSQL -c "SELECT COUNT(*) FROM accounts.accounts;")
MEMBERS=$($PSQL -c "SELECT COUNT(*) FROM accounts.account_members;")
TRANSACTIONS=$($PSQL -c "SELECT COUNT(*) FROM accounts.account_transactions;")
PAYMENTS=$($PSQL -c "SELECT COUNT(*) FROM payments.payments;")

echo "  Users:           $USERS"
echo "  Accounts:        $ACCOUNTS"
echo "  Members:         $MEMBERS"
echo "  Transactions:    $TRANSACTIONS"
echo "  Payments:        $PAYMENTS"
echo ""

# Validate minimum thresholds
[[ "$USERS" -ge 100 ]] && check "Users >= 100" "PASS" || check "Users >= 100" "Got $USERS"
[[ "$ACCOUNTS" -ge 100 ]] && check "Accounts >= 100" "PASS" || check "Accounts >= 100" "Got $ACCOUNTS"
[[ "$TRANSACTIONS" -ge 10000 ]] && check "Transactions >= 10000" "PASS" || check "Transactions >= 10000" "Got $TRANSACTIONS"
echo ""

# ============================================
# 2. Referential Integrity
# ============================================
echo "=== 2. Referential Integrity ==="
echo ""

# Accounts without valid users
ORPHAN_ACCOUNTS=$($PSQL -c "
SELECT COUNT(*) FROM accounts.accounts a
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = a.user_id);
")
check "No orphan accounts" "$( [[ "$ORPHAN_ACCOUNTS" == "0" ]] && echo "PASS" || echo "$ORPHAN_ACCOUNTS orphan accounts" )"

# Members without valid accounts
ORPHAN_MEMBERS_ACC=$($PSQL -c "
SELECT COUNT(*) FROM accounts.account_members m
WHERE NOT EXISTS (SELECT 1 FROM accounts.accounts a WHERE a.id = m.account_id);
")
check "No orphan member-account links" "$( [[ "$ORPHAN_MEMBERS_ACC" == "0" ]] && echo "PASS" || echo "$ORPHAN_MEMBERS_ACC orphans" )"

# Members without valid users
ORPHAN_MEMBERS_USER=$($PSQL -c "
SELECT COUNT(*) FROM accounts.account_members m
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = m.user_id);
")
check "No orphan member-user links" "$( [[ "$ORPHAN_MEMBERS_USER" == "0" ]] && echo "PASS" || echo "$ORPHAN_MEMBERS_USER orphans" )"

# Transactions without valid source or dest
ORPHAN_TRANS=$($PSQL -c "
SELECT COUNT(*) FROM accounts.account_transactions t
WHERE t.source_account_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM accounts.accounts a WHERE a.id = t.source_account_id);
")
check "No orphan transactions (source)" "$( [[ "$ORPHAN_TRANS" == "0" ]] && echo "PASS" || echo "$ORPHAN_TRANS orphans" )"
echo ""

# ============================================
# 3. Transaction Type Distribution
# ============================================
echo "=== 3. Transaction Type Distribution ==="
echo ""

$PSQL -c "
SELECT type, COUNT(*) as count, 
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM accounts.account_transactions), 2) as pct
FROM accounts.account_transactions
GROUP BY type
ORDER BY count DESC;
"
echo ""

# ============================================
# 4. Pagination Test
# ============================================
echo "=== 4. Pagination Test ==="
echo ""

PAGE_SIZE=20

for page in 0 1 2 50 100; do
    OFFSET=$((page * PAGE_SIZE))
    COUNT=$($PSQL -c "
    SELECT COUNT(*) FROM accounts.account_transactions
    WHERE source_account_id = 1
    ORDER BY occurred_at DESC
    LIMIT $PAGE_SIZE OFFSET $OFFSET;
    ")
    echo "  Page $page (offset $OFFSET): $COUNT rows"
done

FIRST_PAGE_TIME=$( { time $PSQL -c "
SELECT * FROM accounts.account_transactions
WHERE source_account_id = 1
ORDER BY occurred_at DESC
LIMIT 20 OFFSET 0;
" > /dev/null; } 2>&1 | grep real | awk '{print $2}')
echo "  First page query time: $FIRST_PAGE_TIME"
echo ""

# ============================================
# 5. Sorting Test
# ============================================
echo "=== 5. Sorting Test ==="
echo ""

echo "  Sort by date DESC:"
$PSQL -c "
EXPLAIN ANALYZE
SELECT * FROM accounts.account_transactions
WHERE source_account_id = 1
ORDER BY occurred_at DESC
LIMIT 10;
" 2>&1 | grep -E "Sort|Index|Seq|time|rows"
echo ""

echo "  Sort by amount:"
$PSQL -c "
EXPLAIN ANALYZE
SELECT * FROM accounts.account_transactions
WHERE source_account_id = 1
ORDER BY amount DESC
LIMIT 10;
" 2>&1 | grep -E "Sort|Index|Seq|time|rows"
echo ""

# ============================================
# 6. Filter Tests
# ============================================
echo "=== 6. Filter Tests ==="
echo ""

echo "  Filter by type (TRANSFER_IN):"
$PSQL -c "
EXPLAIN ANALYZE
SELECT COUNT(*) FROM accounts.account_transactions
WHERE type = 'TRANSFER_IN';
" 2>&1 | grep -E "Index|Seq|time|rows"
echo ""

echo "  Filter by status (COMPLETED):"
$PSQL -c "
EXPLAIN ANALYZE
SELECT COUNT(*) FROM accounts.account_transactions
WHERE status = 'COMPLETED';
" 2>&1 | grep -E "Index|Seq|time|rows"
echo ""

echo "  Filter by date range:"
$PSQL -c "
EXPLAIN ANALYZE
SELECT COUNT(*) FROM accounts.account_transactions
WHERE occurred_at >= '2024-01-01' AND occurred_at < '2024-06-01';
" 2>&1 | grep -E "Index|Seq|time|rows"
echo ""

# ============================================
# 7. Account History Query (Critical Pattern)
# ============================================
echo "=== 7. Account History Query ==="
echo ""

HISTORY_TIME=$( { time $PSQL -c "
SELECT * FROM accounts.account_transactions
WHERE source_account_id = 1 OR destination_account_id = 1
ORDER BY occurred_at DESC
LIMIT 20;
" > /dev/null; } 2>&1 | grep real | awk '{print $2}')
echo "  Account history (20 rows): $HISTORY_TIME"
echo ""

$PSQL -c "
EXPLAIN ANALYZE
SELECT * FROM accounts.account_transactions
WHERE source_account_id = 1 OR destination_account_id = 1
ORDER BY occurred_at DESC
LIMIT 20;
" 2>&1 | grep -E "Index|Seq|Nested|time|rows"
echo ""

# ============================================
# 8. Memory Check
# ============================================
echo "=== 8. Memory Check ==="
echo ""

echo "  Table sizes:"
$PSQL -c "
SELECT 
    pg_size_pretty(pg_total_relation_size('accounts.account_transactions')) as trans_size,
    pg_size_pretty(pg_total_relation_size('accounts.accounts')) as accounts_size,
    pg_size_pretty(pg_total_relation_size('auth.users')) as users_size;
"
echo ""

echo "  Index sizes:"
$PSQL -c "
SELECT 
    pg_size_pretty(pg_relation_size('idx_transactions_account_date')) as hist_idx_size,
    pg_size_pretty(pg_relation_size('idx_transactions_type')) as type_idx_size;
"
echo ""

# ============================================
# 9. ANALYZE Verification
# ============================================
echo "=== 9. ANALYZE Verification ==="
echo ""

$PSQL -c "ANALYZE accounts.account_transactions;"
$PSQL -c "
SELECT schemaname, relname, last_analyze, n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'accounts'
ORDER BY n_live_tup DESC;
"
echo ""

# ============================================
# Summary
# ============================================
echo "============================================"
echo "  SUMMARY"
echo "============================================"
echo ""
echo "  Pass: $PASS"
echo "  Fail: $FAIL"
echo ""

if [[ $FAIL -eq 0 ]]; then
    echo "  STATUS: ALL TESTS PASSED"
else
    echo "  STATUS: SOME TESTS FAILED"
fi
echo ""
