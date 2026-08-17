-- Optimized indices for Coop EC
-- Based on real query patterns

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON auth.users (role);

-- Accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts.accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts.accounts (status);
CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts.account_number;

-- Account members
CREATE INDEX IF NOT EXISTS idx_account_members_user ON accounts.account_members (user_id);
CREATE INDEX IF NOT EXISTS idx_account_members_account ON accounts.account_members (account_id);

-- Account transactions (critical for history queries)
CREATE INDEX IF NOT EXISTS idx_transactions_source ON accounts.account_transactions (source_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_destination ON accounts.account_transactions (destination_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred ON accounts.account_transactions (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON accounts.account_transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON accounts.account_transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON accounts.account_transactions (reference);

-- Composite index for history queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_transactions_account_date 
    ON accounts.account_transactions (source_account_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account_date_dest 
    ON accounts.account_transactions (destination_account_id, occurred_at DESC);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments.payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments.payments (reference);
CREATE INDEX IF NOT EXISTS idx_payments_account ON payments.payments (account_number);

-- Analyze tables after index creation
ANALYZE auth.users;
ANALYZE accounts.accounts;
ANALYZE accounts.account_members;
ANALYZE accounts.account_transactions;
ANALYZE payments.payments;
