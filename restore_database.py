#!/usr/bin/env python3
"""
Database restore script using psycopg2
This script connects to the Neon database and restores from a SQL backup file
"""

import psycopg2
import sys
import re

# Connection string
conn_string = "postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Backup file
backup_file = "database_backup.sql"

print("🔗 Connecting to Neon database...")

try:
    # Connect to database
    conn = psycopg2.connect(conn_string)
    conn.set_session(autocommit=False)
    cur = conn.cursor()
    
    print("✅ Connected successfully!")
    print(f"📦 Restoring from backup: {backup_file}")
    
    # Read the backup file
    try:
        with open(backup_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except FileNotFoundError:
        print(f"❌ Error: Backup file '{backup_file}' not found!")
        sys.exit(1)
    
    # Split SQL statements (handle multi-line statements)
    # Remove comments and split by semicolons
    statements = []
    current_statement = ""
    
    for line in sql_content.split('\n'):
        # Skip comment lines
        if line.strip().startswith('--'):
            continue
        # Skip empty lines
        if not line.strip():
            continue
        
        current_statement += line + '\n'
        
        # If line ends with semicolon, it's a complete statement
        if line.strip().endswith(';'):
            stmt = current_statement.strip()
            if stmt:
                statements.append(stmt)
            current_statement = ""
    
    # Execute statements
    total_statements = len(statements)
    print(f"📋 Found {total_statements} SQL statements to execute")
    
    executed = 0
    errors = 0
    
    for i, statement in enumerate(statements, 1):
        try:
            # Skip empty statements
            if not statement.strip() or statement.strip() == ';':
                continue
            
            # Execute statement
            cur.execute(statement)
            executed += 1
            
            if i % 10 == 0:
                print(f"   Progress: {i}/{total_statements} statements executed...")
                
        except psycopg2.Error as e:
            # Some errors are expected (like DROP TABLE IF EXISTS when table doesn't exist)
            error_msg = str(e).strip()
            if "does not exist" in error_msg.lower():
                # This is expected for DROP TABLE IF EXISTS when table doesn't exist
                executed += 1
            else:
                print(f"⚠️  Warning on statement {i}: {error_msg}")
                errors += 1
                # Continue with other statements
                continue
    
    # Commit all changes
    conn.commit()
    
    print(f"\n✅ Restore completed!")
    print(f"   ✓ Executed: {executed} statements")
    if errors > 0:
        print(f"   ⚠️  Errors: {errors} statements")
    
    cur.close()
    conn.close()
    
except psycopg2.Error as e:
    print(f"❌ Database error: {e}")
    if conn:
        conn.rollback()
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    if 'conn' in locals():
        conn.rollback()
    sys.exit(1)

