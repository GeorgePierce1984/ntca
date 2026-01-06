#!/usr/bin/env python3
"""
Update DATABASE_URL in Vercel using the Vercel API
"""

import os
import subprocess
import json
import sys

# New database connection string
NEW_DB_URL = "postgresql://neondb_owner:REDACTED@ep-winter-sound-abyxdvv7-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def get_vercel_token():
    """Get Vercel token from vercel CLI config"""
    try:
        vercel_dir = os.path.expanduser("~/.vercel")
        auth_file = os.path.join(vercel_dir, "auth.json")
        if os.path.exists(auth_file):
            with open(auth_file, 'r') as f:
                auth = json.load(f)
                return auth.get('token')
    except Exception as e:
        print(f"⚠️  Could not read Vercel token: {e}")
    return None

def get_project_info():
    """Get project ID and team ID"""
    try:
        result = subprocess.run(
            ['vercel', 'ls', '--json'],
            capture_output=True,
            text=True,
            cwd='/Users/georgepierce/Desktop/Projects/ntca/ntca',
            env={**os.environ, 'PATH': '/Users/georgepierce/Desktop/Projects/ntca/ntca/node-v20.11.0-darwin-x64/bin:' + os.environ.get('PATH', '')}
        )
        if result.returncode == 0:
            projects = json.loads(result.stdout)
            for project in projects:
                if project.get('name') == 'ntca':
                    return project.get('id'), project.get('accountId')
    except Exception as e:
        print(f"⚠️  Could not get project info: {e}")
    return None, None

def update_env_via_api():
    """Update environment variable via Vercel API"""
    token = get_vercel_token()
    if not token:
        print("❌ Could not get Vercel token. Please run 'vercel login' first.")
        return False
    
    project_id, team_id = get_project_info()
    if not project_id:
        print("❌ Could not get project ID. Make sure you're in the correct directory.")
        return False
    
    import requests
    
    # Vercel API endpoint
    base_url = "https://api.vercel.com"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Get current environment variables
    url = f"{base_url}/v9/projects/{project_id}/env"
    if team_id:
        url += f"?teamId={team_id}"
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to get environment variables: {response.status_code}")
            print(response.text)
            return False
        
        env_vars = response.json().get('envs', [])
        
        # Find DATABASE_URL
        db_url_var = None
        for var in env_vars:
            if var.get('key') == 'DATABASE_URL':
                db_url_var = var
                break
        
        if not db_url_var:
            print("❌ DATABASE_URL not found in environment variables")
            return False
        
        # Update the variable
        var_id = db_url_var.get('id')
        update_url = f"{base_url}/v9/projects/{project_id}/env/{var_id}"
        if team_id:
            update_url += f"?teamId={team_id}"
        
        # Determine which environments to update
        environments = db_url_var.get('target', ['production', 'preview', 'development'])
        
        payload = {
            "value": NEW_DB_URL,
            "target": environments
        }
        
        response = requests.patch(update_url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("✅ Successfully updated DATABASE_URL in Vercel!")
            print(f"   Environments: {', '.join(environments)}")
            return True
        else:
            print(f"❌ Failed to update DATABASE_URL: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error updating environment variable: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔗 Updating DATABASE_URL in Vercel...")
    print(f"New URL: {NEW_DB_URL[:50]}...")
    print()
    
    # Try API method first
    if update_env_via_api():
        print("\n✅ Update complete! Please redeploy your application.")
    else:
        print("\n⚠️  API update failed. Please use the manual method:")
        print("   1. Go to: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables")
        print("   2. Find DATABASE_URL")
        print("   3. Click 'Edit'")
        print(f"   4. Update value to: {NEW_DB_URL}")
        print("   5. Save and redeploy")

