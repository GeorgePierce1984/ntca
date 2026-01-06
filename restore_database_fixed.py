#!/usr/bin/env python3
"""
Improved database restore script that properly handles timestamps and JSON values
"""

import psycopg2
import sys
import re
from datetime import datetime

# Connection string
conn_string = "postgresql://neondb_owner:YOUR_PASSWORD@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

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
    
    # Process the SQL content
    # Split by semicolons but handle multi-line statements
    statements = []
    current_statement = ""
    in_string = False
    string_char = None
    
    for line in sql_content.split('\n'):
        # Skip comment lines
        if line.strip().startswith('--'):
            continue
        
        # Process line character by character to handle strings properly
        for char in line:
            if char in ("'", '"') and (not in_string or string_char == char):
                in_string = not in_string
                if in_string:
                    string_char = char
                else:
                    string_char = None
            current_statement += char
        
        current_statement += '\n'
        
        # If line ends with semicolon and we're not in a string, it's a complete statement
        if line.strip().endswith(';') and not in_string:
            stmt = current_statement.strip()
            if stmt and not stmt.startswith('--'):
                statements.append(stmt)
            current_statement = ""
    
    # Add any remaining statement
    if current_statement.strip():
        statements.append(current_statement.strip())
    
    print(f"📋 Found {len(statements)} SQL statements to execute")
    
    executed = 0
    errors = 0
    successful_tables = []
    
    # Execute statements with better error handling
    for i, statement in enumerate(statements, 1):
        if not statement.strip() or statement.strip() == ';':
            continue
        
        try:
            # Fix common issues in the SQL
            # Quote unquoted timestamps (format: YYYY-MM-DD HH:MM:SS...)
            fixed_stmt = re.sub(
                r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[^',)]*)",
                r"'\1'",
                statement
            )
            
            # Fix JSON objects that aren't quoted
            # Look for patterns like {key: value} that aren't in quotes
            fixed_stmt = re.sub(
                r"([,\(])\s*(\{[^}]*\})\s*([,\)])",
                r"\1'\2'\3",
                fixed_stmt
            )
            
            # Execute statement
            cur.execute(fixed_stmt)
            executed += 1
            
            # Track successful table operations
            if 'CREATE TABLE' in fixed_stmt.upper():
                table_match = re.search(r'CREATE TABLE\s+(\w+)', fixed_stmt, re.IGNORECASE)
                if table_match:
                    successful_tables.append(table_match.group(1))
            
            if i % 50 == 0:
                print(f"   Progress: {i}/{len(statements)} statements executed...")
                
        except psycopg2.Error as e:
            error_msg = str(e).strip()
            
            # Ignore "does not exist" errors for DROP TABLE IF EXISTS
            if "does not exist" in error_msg.lower() and "DROP TABLE" in statement.upper():
                executed += 1
                continue
            
            # For other errors, try to continue but log them
            if errors < 10:  # Only show first 10 errors
                print(f"⚠️  Warning on statement {i}: {error_msg[:100]}")
            errors += 1
            
            # Rollback and continue with next statement
            try:
                conn.rollback()
            except:
                pass
            continue
    
    # Commit all successful changes
    try:
        conn.commit()
        print(f"\n✅ Restore completed!")
        print(f"   ✓ Executed: {executed} statements")
        if errors > 0:
            print(f"   ⚠️  Errors: {errors} statements (some may be expected)")
        if successful_tables:
            print(f"   ✓ Tables created: {len(successful_tables)}")
    except Exception as e:
        print(f"⚠️  Commit warning: {e}")
        conn.rollback()
    
    cur.close()
    conn.close()
    
except psycopg2.Error as e:
    print(f"❌ Database error: {e}")
    if 'conn' in locals():
        conn.rollback()
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    if 'conn' in locals():
        conn.rollback()
    sys.exit(1)

