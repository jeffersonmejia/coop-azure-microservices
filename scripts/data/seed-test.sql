-- Seed test data for Coop EC
-- Small dataset for integration tests

BEGIN;

-- Test users
INSERT INTO auth.users (id, email, password, first_name, last_name, role, enabled, created_at, updated_at) VALUES
(1, 'user1@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Alice', 'Smith', 'USER', true, '2024-01-01', '2024-01-01'),
(2, 'user2@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Bob', 'Johnson', 'USER', true, '2024-01-01', '2024-01-01'),
(3, 'user3@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Carol', 'Williams', 'USER', true, '2024-01-01', '2024-01-01'),
(4, 'user4@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'David', 'Brown', 'USER', true, '2024-01-01', '2024-01-01'),
(5, 'user5@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Eva', 'Davis', 'USER', true, '2024-01-01', '2024-01-01'),
(6, 'user6@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Frank', 'Miller', 'USER', true, '2024-01-01', '2024-01-01'),
(7, 'user7@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Grace', 'Wilson', 'USER', true, '2024-01-01', '2024-01-01'),
(8, 'user8@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Henry', 'Moore', 'USER', true, '2024-01-01', '2024-01-01'),
(9, 'user9@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Ivy', 'Taylor', 'USER', true, '2024-01-01', '2024-01-01'),
(10, 'user10@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Jack', 'Anderson', 'USER', true, '2024-01-01', '2024-01-01'),
(11, 'admin@test.com', '$2a$10$dummy.hash.for.testing.purposes.only', 'Admin', 'User', 'ADMIN', true, '2024-01-01', '2024-01-01');

SELECT setval('auth.users_id_seq', 11);

-- Test accounts
INSERT INTO accounts.accounts (id, account_number, user_id, balance, status, created_at, updated_at) VALUES
(1, 'TEST000001', 1, 5000.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(2, 'TEST000002', 2, 3500.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(3, 'TEST000003', 3, 7500.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(4, 'TEST000004', 4, 1200.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(5, 'TEST000005', 5, 9800.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(6, 'TEST000006', 6, 450.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(7, 'TEST000007', 7, 12000.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(8, 'TEST000008', 8, 890.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(9, 'TEST000009', 9, 6700.00, 'ACTIVE', '2024-01-01', '2024-01-01'),
(10, 'TEST000010', 10, 2100.00, 'ACTIVE', '2024-01-01', '2024-01-01');

SELECT setval('accounts.accounts_id_seq', 10);

-- Account members
INSERT INTO accounts.account_members (id, user_id, account_id, created_at) VALUES
(1, 1, 1, '2024-01-01'),
(2, 2, 2, '2024-01-01'),
(3, 3, 3, '2024-01-01'),
(4, 4, 4, '2024-01-01'),
(5, 5, 5, '2024-01-01'),
(6, 6, 6, '2024-01-01'),
(7, 7, 7, '2024-01-01'),
(8, 8, 8, '2024-01-01'),
(9, 9, 9, '2024-01-01'),
(10, 10, 10, '2024-01-01');

SELECT setval('accounts.account_members_id_seq', 10);

-- Test transactions (100 rows)
INSERT INTO accounts.account_transactions (id, source_account_id, destination_account_id, amount, type, status, occurred_at, reference, created_at)
SELECT 
    g,
    CASE WHEN g % 3 = 0 THEN NULL ELSE (g % 10) + 1 END,
    CASE WHEN g % 3 = 1 THEN NULL ELSE ((g + 5) % 10) + 1 END,
    ROUND((random() * 1000)::numeric, 2),
    CASE (g % 5)
        WHEN 0 THEN 'DEPOSIT'
        WHEN 1 THEN 'WITHDRAWAL'
        WHEN 2 THEN 'TRANSFER_IN'
        WHEN 3 THEN 'TRANSFER_OUT'
        ELSE 'PAYMENT'
    END,
    'COMPLETED',
    '2024-01-01'::timestamp + (g || ' days')::interval,
    'TEST-' || LPAD(g::text, 6, '0'),
    '2024-01-01'
FROM generate_series(1, 100) g;

SELECT setval('accounts.account_transactions_id_seq', 100);

-- Test payments
INSERT INTO payments.payments (id, user_id, account_number, amount, description, status, failure_reason, reference, created_at, updated_at) VALUES
(1, 1, 'TEST000001', 150.00, 'Electric bill', 'COMPLETED', NULL, 'PAY-TEST-001', '2024-01-15', '2024-01-15'),
(2, 2, 'TEST000002', 89.99, 'Internet service', 'COMPLETED', NULL, 'PAY-TEST-002', '2024-01-16', '2024-01-16'),
(3, 3, 'TEST000003', 250.00, 'Water bill', 'COMPLETED', NULL, 'PAY-TEST-003', '2024-01-17', '2024-01-17'),
(4, 4, 'TEST000004', 45.50, 'Phone credit', 'COMPLETED', NULL, 'PAY-TEST-004', '2024-01-18', '2024-01-18'),
(5, 5, 'TEST000005', 320.00, 'Insurance', 'COMPLETED', NULL, 'PAY-TEST-005', '2024-01-19', '2024-01-19'),
(6, 6, 'TEST000006', 75.00, 'Gas bill', 'FAILED', 'Insufficient funds', 'PAY-TEST-006', '2024-01-20', '2024-01-20'),
(7, 7, 'TEST000007', 180.00, 'Internet service', 'COMPLETED', NULL, 'PAY-TEST-007', '2024-01-21', '2024-01-21'),
(8, 8, 'TEST000008', 99.99, 'Electric bill', 'COMPLETED', NULL, 'PAY-TEST-008', '2024-01-22', '2024-01-22'),
(9, 9, 'TEST000009', 150.00, 'Water bill', 'PENDING', NULL, 'PAY-TEST-009', '2024-01-23', '2024-01-23'),
(10, 10, 'TEST000010', 200.00, 'Insurance', 'COMPLETED', NULL, 'PAY-TEST-010', '2024-01-24', '2024-01-24');

SELECT setval('payments.payments_id_seq', 10);

COMMIT;

-- Verify
SELECT 'auth.users' as table_name, COUNT(*) as row_count FROM auth.users
UNION ALL
SELECT 'accounts.accounts', COUNT(*) FROM accounts.accounts
UNION ALL
SELECT 'accounts.account_members', COUNT(*) FROM accounts.account_members
UNION ALL
SELECT 'accounts.account_transactions', COUNT(*) FROM accounts.account_transactions
UNION ALL
SELECT 'payments.payments', COUNT(*) FROM payments.payments;
