CREATE SCHEMA IF NOT EXISTS accounts;

CREATE TABLE IF NOT EXISTS accounts.accounts (
    id BIGSERIAL PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    balance NUMERIC(19,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts.account_members (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts.account_transactions (
    id BIGSERIAL PRIMARY KEY,
    source_account_id BIGINT,
    destination_account_id BIGINT,
    amount NUMERIC(19,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts.accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_account_members_account_id ON accounts.account_members (account_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_source ON accounts.account_transactions (source_account_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_destination ON accounts.account_transactions (destination_account_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_occurred_at ON accounts.account_transactions (occurred_at);
