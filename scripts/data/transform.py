#!/usr/bin/env python3
"""
Transform Berka/PKDD'99 dataset to Coop EC format.

Mapping:
  client  → auth.users (synthetic credentials)
  account → accounts.accounts
  disp    → accounts.account_members
  trans   → accounts.account_transactions
  order   → payments.payments
"""

import csv
import sys
import os
from datetime import datetime
from pathlib import Path

# Transaction type mapping from Berka to Coop EC
# Berka types: VYBER, VYBER KARTOU, PREVOD Z UCTU, PREVOD NA UCET, 
#              POJISTNE, SLUZBY, UROK, SANKCNI UROK, SEPA, DUNCHOLD
TRANSACTION_TYPE_MAP = {
    'VYBER': 'WITHDRAWAL',
    'VYBER KARTOU': 'WITHDRAWAL',
    'PREVOD Z UCTU': 'TRANSFER_IN',
    'PREVOD NA UCET': 'TRANSFER_OUT',
    'POJISTNE': 'PAYMENT',
    'SLUZBY': 'PAYMENT',
    'UROK': 'DEPOSIT',
    'SANKCNI UROK': 'OTHER',
    'SEPA': 'TRANSFER_IN',
    'DUNCHOLD': 'OTHER',
}


def parse_amount(amount_str):
    """Parse amount from Berka format (with dots as thousands separator)."""
    return float(amount_str.replace('.', ''))


def parse_date(date_str):
    """Parse date from Berka format (YYMMDD)."""
    try:
        year = int(date_str[:2])
        month = int(date_str[2:4])
        day = int(date_str[4:6])
        # Berka dates are from 1990s, adjust to 2000s for realism
        full_year = 2000 + year if year < 50 else 1900 + year
        return f"{full_year}-{month:02d}-{day:02d}"
    except (ValueError, IndexError):
        return None


def transform_client(client_file, output_dir):
    """Transform Berka clients to Coop EC users."""
    users = []
    user_id_map = {}  # berka_id -> coop_id
    
    with open(client_file, 'r') as f:
        reader = csv.reader(f, delimiter=';')
        for i, row in enumerate(reader, 1):
            if len(row) < 4:
                continue
            
            berka_id = int(row[0])
            gender = row[1]  # 'F' or 'M'
            birth_date = row[2]
            district_id = row[3]
            
            # Generate synthetic user data
            first_name = f"User{i:04d}"
            last_name = f"Berka{berka_id}"
            email = f"user{i:04d}@berka.test"
            password = "$2a$10$dummy.hash.for.testing.purposes.only"
            role = 'USER'
            
            users.append({
                'id': i,
                'email': email,
                'password': password,
                'first_name': first_name,
                'last_name': last_name,
                'role': role,
                'enabled': 'true',
                'created_at': '2024-01-01 00:00:00',
                'updated_at': '2024-01-01 00:00:00',
            })
            user_id_map[berka_id] = i
    
    # Write users CSV
    with open(os.path.join(output_dir, 'users.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=users[0].keys())
        writer.writeheader()
        writer.writerows(users)
    
    return user_id_map


def transform_account(account_file, output_dir, user_id_map):
    """Transform Berka accounts to Coop EC accounts."""
    accounts = []
    account_id_map = {}  # berka_id -> coop_id
    
    with open(account_file, 'r') as f:
        reader = csv.reader(f, delimiter=';')
        for i, row in enumerate(reader, 1):
            if len(row) < 4:
                continue
            
            berka_id = int(row[0])
            district_id = row[1]
            frequency = row[2]  # 'POPLATEK MESICNE' etc
            created_date = row[3]
            
            # Generate account number
            account_number = f"BERKA{berka_id:06d}"
            
            accounts.append({
                'id': i,
                'account_number': account_number,
                'user_id': user_id_map.get(berka_id, 1),
                'balance': '1000.00',  # Default balance
                'status': 'ACTIVE',
                'created_at': parse_date(created_date) or '2024-01-01',
                'updated_at': '2024-01-01 00:00:00',
            })
            account_id_map[berka_id] = i
    
    # Write accounts CSV
    with open(os.path.join(output_dir, 'accounts.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=accounts[0].keys())
        writer.writeheader()
        writer.writerows(accounts)
    
    return account_id_map


def transform_disp(disp_file, output_dir, user_id_map, account_id_map):
    """Transform Berka dispositions to account_members."""
    members = []
    
    with open(disp_file, 'r') as f:
        reader = csv.reader(f, delimiter=';')
        for i, row in enumerate(reader, 1):
            if len(row) < 4:
                continue
            
            berka_id = int(row[0])
            client_id = int(row[1])
            account_id = int(row[2])
            disp_type = row[3]  # 'OWNER' or 'DISPONENT'
            
            members.append({
                'id': i,
                'user_id': user_id_map.get(client_id, 1),
                'account_id': account_id_map.get(account_id, 1),
                'created_at': '2024-01-01 00:00:00',
            })
    
    # Write members CSV
    with open(os.path.join(output_dir, 'account_members.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=members[0].keys())
        writer.writeheader()
        writer.writerows(members)
    
    return members


def transform_transaction(trans_file, output_dir, account_id_map):
    """Transform Berka transactions to account_transactions."""
    transactions = []
    trans_id = 0
    
    with open(trans_file, 'r') as f:
        reader = csv.reader(f, delimiter=';')
        for row in reader:
            if len(row) < 10:
                continue
            
            trans_id += 1
            account_id = int(row[0])
            trans_date = row[1]
            trans_type = row[2]
            amount = parse_amount(row[3])
            balance = parse_amount(row[4])
            
            # Map transaction type
            coop_type = TRANSACTION_TYPE_MAP.get(trans_type, 'OTHER')
            
            # Determine source and destination
            source_account_id = None
            dest_account_id = None
            
            if coop_type == 'TRANSFER_IN':
                dest_account_id = account_id_map.get(account_id)
            elif coop_type == 'TRANSFER_OUT':
                source_account_id = account_id_map.get(account_id)
            elif coop_type in ('WITHDRAWAL', 'PAYMENT'):
                source_account_id = account_id_map.get(account_id)
            elif coop_type == 'DEPOSIT':
                dest_account_id = account_id_map.get(account_id)
            
            transactions.append({
                'id': trans_id,
                'source_account_id': source_account_id,
                'destination_account_id': dest_account_id,
                'amount': f"{amount:.2f}",
                'type': coop_type,
                'status': 'COMPLETED',
                'occurred_at': parse_date(trans_date) or '2024-01-01',
                'reference': f"BERKA-{trans_id:08d}",
                'created_at': '2024-01-01 00:00:00',
            })
            
            # Write in batches to avoid memory issues
            if trans_id % 100000 == 0:
                print(f"  Processed {trans_id} transactions...")
                write_transactions_batch(transactions, output_dir, trans_id == 100000)
                transactions = []
    
    # Write remaining
    if transactions:
        write_transactions_batch(transactions, output_dir, False)
    
    return trans_id


def write_transactions_batch(transactions, output_dir, is_first_batch):
    """Write transactions to CSV in append mode."""
    mode = 'w' if is_first_batch else 'a'
    with open(os.path.join(output_dir, 'account_transactions.csv'), mode, newline='') as f:
        if transactions:
            writer = csv.DictWriter(f, fieldnames=transactions[0].keys())
            if is_first_batch:
                writer.writeheader()
            writer.writerows(transactions)


def transform_order(order_file, output_dir, account_id_map):
    """Transform Berka orders to payments."""
    payments = []
    
    with open(order_file, 'r') as f:
        reader = csv.reader(f, delimiter=';')
        for i, row in enumerate(reader, 1):
            if len(row) < 6:
                continue
            
            order_id = int(row[0])
            account_id = int(row[1])
            amount = parse_amount(row[3])
            
            payments.append({
                'id': i,
                'user_id': None,
                'account_number': f"BERKA{account_id:06d}",
                'amount': f"{amount:.2f}",
                'description': f"Historical order {order_id}",
                'status': 'COMPLETED',
                'failure_reason': None,
                'reference': f"ORDER-{order_id:06d}",
                'created_at': '2024-01-01 00:00:00',
                'updated_at': '2024-01-01 00:00:00',
            })
    
    # Write payments CSV
    with open(os.path.join(output_dir, 'payments.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=payments[0].keys())
        writer.writeheader()
        writer.writerows(payments)
    
    return payments


def generate_load_sql(output_dir, mode):
    """Generate SQL file for bulk loading."""
    sql_lines = []
    
    if mode == 'full':
        sql_lines.append("-- Bulk load Berka data into Coop EC")
        sql_lines.append("-- Generated by transform.py")
        sql_lines.append("")
        sql_lines.append("BEGIN;")
        sql_lines.append("")
        
        # Load users
        sql_lines.append("-- Load users")
        sql_lines.append("\\COPY auth.users (id, email, password, first_name, last_name, role, enabled, created_at, updated_at)")
        sql_lines.append(f"FROM '{output_dir}/users.csv' WITH CSV HEADER;")
        sql_lines.append("")
        
        # Reset sequence
        sql_lines.append("SELECT setval('auth.users_id_seq', (SELECT MAX(id) FROM auth.users));")
        sql_lines.append("")
        
        # Load accounts
        sql_lines.append("-- Load accounts")
        sql_lines.append("\\COPY accounts.accounts (id, account_number, user_id, balance, status, created_at, updated_at)")
        sql_lines.append(f"FROM '{output_dir}/accounts.csv' WITH CSV HEADER;")
        sql_lines.append("")
        
        sql_lines.append("SELECT setval('accounts.accounts_id_seq', (SELECT MAX(id) FROM accounts.accounts));")
        sql_lines.append("")
        
        # Load account members
        sql_lines.append("-- Load account members")
        sql_lines.append("\\COPY accounts.account_members (id, user_id, account_id, created_at)")
        sql_lines.append(f"FROM '{output_dir}/account_members.csv' WITH CSV HEADER;")
        sql_lines.append("")
        
        sql_lines.append("SELECT setval('accounts.account_members_id_seq', (SELECT MAX(id) FROM accounts.account_members));")
        sql_lines.append("")
        
        # Load transactions (this is the big one)
        sql_lines.append("-- Load transactions (~1M rows)")
        sql_lines.append("\\COPY accounts.account_transactions (id, source_account_id, destination_account_id, amount, type, status, occurred_at, reference, created_at)")
        sql_lines.append(f"FROM '{output_dir}/account_transactions.csv' WITH CSV HEADER;")
        sql_lines.append("")
        
        sql_lines.append("SELECT setval('accounts.account_transactions_id_seq', (SELECT MAX(id) FROM accounts.account_transactions));")
        sql_lines.append("")
        
        # Load payments
        sql_lines.append("-- Load payments")
        sql_lines.append("\\COPY payments.payments (id, user_id, account_number, amount, description, status, failure_reason, reference, created_at, updated_at)")
        sql_lines.append(f"FROM '{output_dir}/payments.csv' WITH CSV HEADER;")
        sql_lines.append("")
        
        sql_lines.append("SELECT setval('payments.payments_id_seq', (SELECT MAX(id) FROM payments.payments));")
        sql_lines.append("")
        
        sql_lines.append("COMMIT;")
    
    with open(os.path.join(output_dir, 'load-data.sql'), 'w') as f:
        f.write('\n'.join(sql_lines))


def main():
    if len(sys.argv) < 3:
        print("Usage: transform.py <mode> <data_dir> <output_dir>")
        print("  mode: full or test")
        sys.exit(1)
    
    mode = sys.argv[1]
    data_dir = sys.argv[2]
    output_dir = sys.argv[3]
    
    if mode == 'test':
        print("Test mode: generating small seed dataset...")
        # For test mode, we'll use seed-test.sql instead
        print("Use seed-test.sql for test data")
        return
    
    print(f"Transforming Berka data from {data_dir}...")
    
    # Check if data files exist
    required_files = ['client.asc', 'account.asc', 'disp.asc', 'trans.asc', 'order.asc']
    for f in required_files:
        if not os.path.exists(os.path.join(data_dir, f)):
            print(f"Error: {f} not found in {data_dir}")
            print("Please download the Berka dataset first")
            sys.exit(1)
    
    # Transform
    print("  Transforming clients...")
    user_id_map = transform_client(os.path.join(data_dir, 'client.asc'), output_dir)
    print(f"    -> {len(user_id_map)} users")
    
    print("  Transforming accounts...")
    account_id_map = transform_account(os.path.join(data_dir, 'account.asc'), output_dir, user_id_map)
    print(f"    -> {len(account_id_map)} accounts")
    
    print("  Transforming dispositions...")
    members = transform_disp(os.path.join(data_dir, 'disp.asc'), output_dir, user_id_map, account_id_map)
    print(f"    -> {len(members)} account members")
    
    print("  Transforming transactions...")
    trans_count = transform_transaction(os.path.join(data_dir, 'trans.asc'), output_dir, account_id_map)
    print(f"    -> {trans_count} transactions")
    
    print("  Transforming orders...")
    payments = transform_order(os.path.join(data_dir, 'order.asc'), output_dir, account_id_map)
    print(f"    -> {len(payments)} payments")
    
    # Generate load SQL
    print("  Generating load SQL...")
    generate_load_sql(output_dir, mode)
    
    print(f"Transformation complete. Output in {output_dir}")


if __name__ == '__main__':
    main()
