#!/usr/bin/env python3
"""
Direct database copy script
Copies all data from source database to destination database
"""

import psycopg2
import sys
import json
from psycopg2.extras import execute_values, Json
from psycopg2.extensions import register_adapter

# Register JSON adapter
register_adapter(dict, Json)
register_adapter(list, Json)

# Source database (original)
SOURCE_CONN_STRING = "postgresql://neondb_owner:REDACTED@ep-purple-union-ab9djram-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Destination database (new)
DEST_CONN_STRING = "postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

print("🔗 Connecting to databases...")

try:
    # Connect to source database
    source_conn = psycopg2.connect(SOURCE_CONN_STRING)
    source_cur = source_conn.cursor()
    print("✅ Connected to source database")
    
    # Connect to destination database
    dest_conn = psycopg2.connect(DEST_CONN_STRING)
    dest_cur = dest_conn.cursor()
    print("✅ Connected to destination database")
    
    # Copy custom types/enums first
    print("\n🔄 Copying custom types...")
    source_cur.execute("""
        SELECT t.typname, string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) as enum_values
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname;
    """)
    
    enums = source_cur.fetchall()
    for enum_name, enum_values in enums:
        try:
            # Check if enum exists
            dest_cur.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM pg_type 
                    WHERE typname = %s
                );
            """, (enum_name,))
            exists = dest_cur.fetchone()[0]
            
            if not exists:
                values = enum_values.split(',')
                enum_values_str = ', '.join([f"'{v}'" for v in values])
                create_enum = f'CREATE TYPE "{enum_name}" AS ENUM ({enum_values_str});'
                dest_cur.execute(create_enum)
                dest_conn.commit()
                print(f"   ✓ Created enum: {enum_name}")
        except Exception as e:
            print(f"   ⚠️  Could not create enum {enum_name}: {e}")
    
    # Get all tables from source
    source_cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    
    tables = source_cur.fetchall()
    print(f"\n📋 Found {len(tables)} tables to copy")
    
    # Process each table
    for (table_name,) in tables:
        print(f"\n📦 Processing table: {table_name}")
        
        try:
            # Get table structure from source
            source_cur.execute(f"""
                SELECT column_name, data_type, character_maximum_length, 
                       is_nullable, column_default, udt_name
                FROM information_schema.columns
                WHERE table_schema = 'public' 
                AND table_name = '{table_name}'
                ORDER BY ordinal_position;
            """)
            
            columns = source_cur.fetchall()
            if not columns:
                print(f"   ⚠️  No columns found, skipping")
                continue
            
            # Build CREATE TABLE statement
            col_defs = []
            col_names = []
            for col in columns:
                col_name, data_type, max_length, is_nullable, default, udt_name = col
                col_names.append(col_name)
                
                # Handle enum types - need to quote them
                if udt_name and udt_name[0].isupper():
                    # Likely an enum type, quote it
                    type_name = f'"{udt_name}"'
                else:
                    type_name = udt_name
                
                col_def = f'    "{col_name}" {type_name}'
                if max_length:
                    col_def += f"({max_length})"
                if is_nullable == 'NO':
                    col_def += " NOT NULL"
                if default:
                    # Fix default values that reference enums
                    if '::' in str(default) and default.split('::')[1].strip('"')[0].isupper():
                        # Enum default value
                        enum_val = default.split('::')[0].strip("'\"")
                        enum_type = default.split('::')[1].strip('"')
                        col_def += f" DEFAULT '{enum_val}'::\"{enum_type}\""
                    else:
                        col_def += f" DEFAULT {default}"
                col_defs.append(col_def)
            
            # Drop table if exists
            dest_cur.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE;')
            
            # Create table
            create_sql = f'CREATE TABLE "{table_name}" (\n' + ',\n'.join(col_defs) + '\n);'
            dest_cur.execute(create_sql)
            dest_conn.commit()
            print(f"   ✓ Table structure created")
            
            # Get all data from source
            source_cur.execute(f'SELECT * FROM "{table_name}";')
            rows = source_cur.fetchall()
            
            if not rows:
                print(f"   ✓ No data to copy (empty table)")
                continue
            
            print(f"   📥 Copying {len(rows)} rows...")
            
            # Get column names for INSERT
            column_list = ', '.join([f'"{col}"' for col in col_names])
            placeholders = ', '.join(['%s'] * len(col_names))
            insert_sql = f'INSERT INTO "{table_name}" ({column_list}) VALUES ({placeholders})'
            
            # Get column types to handle JSON/dict properly
            source_cur.execute(f"""
                SELECT column_name, udt_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'public' 
                AND table_name = '{table_name}'
                ORDER BY ordinal_position;
            """)
            col_info = {row[0]: (row[1], row[2]) for row in source_cur.fetchall()}
            
            # Process rows to convert dict/list to Json
            processed_rows = []
            for row in rows:
                processed_row = []
                for idx, val in enumerate(row):
                    col_name = col_names[idx]
                    col_type, data_type = col_info.get(col_name, ('', ''))
                    
                    # Handle arrays (PostgreSQL array types)
                    is_array_type = col_type and (col_type.endswith('[]') or '_array' in col_type.lower())
                    is_array_value = isinstance(val, list) and col_type not in ('json', 'jsonb', 'jsonb[]')
                    
                    if is_array_type or is_array_value:
                        # PostgreSQL array
                        if isinstance(val, list):
                            # Convert list to PostgreSQL array format
                            if len(val) == 0:
                                processed_row.append('{}')  # Empty array
                            else:
                                # Format as PostgreSQL array: {val1,val2,val3}
                                array_str = '{' + ','.join([str(v).replace(',', '\\,') for v in val]) + '}'
                                processed_row.append(array_str)
                        elif isinstance(val, str) and val.startswith('[') and val.endswith(']'):
                            # JSON array string, convert to PostgreSQL array
                            try:
                                json_list = json.loads(val)
                                if len(json_list) == 0:
                                    processed_row.append('{}')
                                else:
                                    array_str = '{' + ','.join([str(v).replace(',', '\\,') for v in json_list]) + '}'
                                    processed_row.append(array_str)
                            except:
                                processed_row.append(val)
                        else:
                            processed_row.append(val)
                    # Convert dict/list to Json for JSON/JSONB columns
                    elif isinstance(val, (dict, list)):
                        processed_row.append(Json(val))
                    elif val is not None and (col_type in ('json', 'jsonb') or data_type in ('json', 'jsonb')):
                        # Already a string, but ensure it's valid JSON
                        if isinstance(val, str):
                            try:
                                json.loads(val)  # Validate
                                processed_row.append(val)
                            except:
                                processed_row.append(Json(val) if isinstance(val, (dict, list)) else val)
                        else:
                            processed_row.append(Json(val))
                    else:
                        processed_row.append(val)
                processed_rows.append(tuple(processed_row))
            
            # Copy data in batches
            batch_size = 100
            total_copied = 0
            
            for i in range(0, len(processed_rows), batch_size):
                batch = processed_rows[i:i + batch_size]
                try:
                    dest_cur.executemany(insert_sql, batch)
                    total_copied += len(batch)
                    if total_copied % 500 == 0 or total_copied == len(processed_rows):
                        print(f"      Progress: {total_copied}/{len(processed_rows)} rows copied...")
                except Exception as e:
                    print(f"      ⚠️  Error copying batch: {e}")
                    dest_conn.rollback()
                    # Try row by row for this batch
                    for row in batch:
                        try:
                            dest_cur.execute(insert_sql, row)
                            total_copied += 1
                        except Exception as row_error:
                            print(f"      ⚠️  Skipped row due to error: {row_error}")
                            continue
            
            dest_conn.commit()
            print(f"   ✅ Copied {total_copied} rows successfully")
            
        except Exception as e:
            print(f"   ❌ Error processing table: {e}")
            dest_conn.rollback()
            continue
    
    # Copy sequences and other objects if needed
    print(f"\n🔄 Copying sequences...")
    source_cur.execute("""
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public';
    """)
    
    sequences = source_cur.fetchall()
    for (seq_name,) in sequences:
        try:
            source_cur.execute(f"SELECT last_value FROM {seq_name};")
            last_val = source_cur.fetchone()[0]
            dest_cur.execute(f"SELECT setval('{seq_name}', {last_val}, false);")
            dest_conn.commit()
            print(f"   ✓ Sequence {seq_name} set to {last_val}")
        except Exception as e:
            print(f"   ⚠️  Could not copy sequence {seq_name}: {e}")
    
    print(f"\n✅ Database copy completed!")
    
    # Verify
    dest_cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    dest_tables = dest_cur.fetchall()
    print(f"\n📊 Verification:")
    print(f"   ✓ Tables in destination: {len(dest_tables)}")
    
    for (table_name,) in dest_tables:
        dest_cur.execute(f'SELECT COUNT(*) FROM "{table_name}";')
        count = dest_cur.fetchone()[0]
        source_cur.execute(f'SELECT COUNT(*) FROM "{table_name}";')
        source_count = source_cur.fetchone()[0]
        status = "✅" if count == source_count else "⚠️"
        print(f"   {status} {table_name}: {count}/{source_count} rows")
    
    source_cur.close()
    source_conn.close()
    dest_cur.close()
    dest_conn.close()
    
except psycopg2.Error as e:
    print(f"❌ Database error: {e}")
    if 'source_conn' in locals():
        source_conn.close()
    if 'dest_conn' in locals():
        dest_conn.rollback()
        dest_conn.close()
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    if 'source_conn' in locals():
        source_conn.close()
    if 'dest_conn' in locals():
        dest_conn.rollback()
        dest_conn.close()
    sys.exit(1)

