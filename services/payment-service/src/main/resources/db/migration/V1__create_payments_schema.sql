CREATE SCHEMA IF NOT EXISTS payments;

CREATE TABLE IF NOT EXISTS payments.payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    account_number VARCHAR(20) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(255),
    reference VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments.payments (created_at);
