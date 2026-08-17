#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/berka-data"
OUTPUT_DIR="$SCRIPT_DIR/berka-output"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-coop}"
DB_USER="${DB_USER:-coop}"
DB_PASSWORD="${DB_PASSWORD:-coop}"

echo "=== Berka Dataset Importer for Coop EC ==="
echo ""

# Check dependencies
command -v psql >/dev/null 2>&1 || { echo "Error: psql not found"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Error: python3 not found"; exit 1; }

# Parse arguments
MODE="${1:-full}"
if [[ "$MODE" != "full" && "$MODE" != "test" ]]; then
    echo "Usage: $0 [full|test]"
    echo "  full  - Import complete Berka dataset (~1M transactions)"
    echo "  test  - Import small test dataset"
    exit 1
fi

echo "Mode: $MODE"
echo ""

# Step 1: Download dataset (only for full mode)
if [[ "$MODE" == "full" ]]; then
    echo "=== Step 1: Downloading Berka dataset ==="
    bash "$SCRIPT_DIR/download-berka.sh" "$DATA_DIR"
    echo ""
fi

# Step 2: Transform data
echo "=== Step 2: Transforming data ==="
mkdir -p "$OUTPUT_DIR"
python3 "$SCRIPT_DIR/transform.py" "$MODE" "$DATA_DIR" "$OUTPUT_DIR"
echo ""

# Step 3: Load data
echo "=== Step 3: Loading data into PostgreSQL ==="
export PGPASSWORD="$DB_PASSWORD"
PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER"

if [[ "$MODE" == "test" ]]; then
    echo "Loading test seed data..."
    $PSQL_CMD -f "$SCRIPT_DIR/seed-test.sql"
else
    echo "Loading transformed Berka data..."
    $PSQL_CMD -f "$OUTPUT_DIR/load-data.sql"
fi
echo ""

# Step 4: Create optimized indices
echo "=== Step 4: Creating optimized indices ==="
$PSQL_CMD -f "$SCRIPT_DIR/indices.sql"
echo ""

# Step 5: Analyze tables
echo "=== Step 5: Analyzing tables ==="
$PSQL_CMD -c "ANALYZE auth.users;"
$PSQL_CMD -c "ANALYZE accounts.accounts;"
$PSQL_CMD -c "ANALYZE accounts.account_members;"
$PSQL_CMD -c "ANALYZE accounts.account_transactions;"
$PSQL_CMD -c "ANALYZE payments.payments;"
echo ""

# Step 6: Validate
echo "=== Step 6: Validating import ==="
$PSQL_CMD -c "
SELECT 'auth.users' as table_name, COUNT(*) as row_count FROM auth.users
UNION ALL
SELECT 'accounts.accounts', COUNT(*) FROM accounts.accounts
UNION ALL
SELECT 'accounts.account_members', COUNT(*) FROM accounts.account_members
UNION ALL
SELECT 'accounts.account_transactions', COUNT(*) FROM accounts.account_transactions
UNION ALL
SELECT 'payments.payments', COUNT(*) FROM payments.payments;
"
echo ""

echo "=== Import complete ==="
