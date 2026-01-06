#!/usr/bin/env python3
"""
Deploy webhook-debug.js to GitHub via API
"""

import os
import base64
import requests
import json

# Configuration
REPO_OWNER = "rogit85"
REPO_NAME = "ntca"
FILE_PATH = "api/webhook-debug.js"
BRANCH = "main"
COMMIT_MESSAGE = "Deploy webhook debug endpoint"
GITHUB_EMAIL = "georgepierce@hotmail.co.uk"
GITHUB_USERNAME = "George Pierce"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}

def get_current_file_sha(owner, repo, path, branch):
    """Get the SHA of the current file if it exists"""
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    try:
        response = requests.get(url, headers=HEADERS, verify=False)
        if response.status_code == 200:
            return response.json()["sha"]
        elif response.status_code == 404:
            return None  # File doesn't exist yet
        else:
            response.raise_for_status()
    except Exception as e:
        print(f"Error checking file: {e}")
        return None

def update_file(owner, repo, path, branch, message, content, sha, committer_name, committer_email):
    """Create or update a file on GitHub"""
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    
    payload = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
        "branch": branch,
        "committer": {
            "name": committer_name,
            "email": committer_email
        },
        "author": {
            "name": committer_name,
            "email": committer_email
        }
    }
    
    # Only include sha if file exists (for update)
    if sha:
        payload["sha"] = sha
    
    response = requests.put(url, headers=HEADERS, data=json.dumps(payload), verify=False)
    response.raise_for_status()
    return response.json()

def main():
    print("🚀 Deploying webhook debug endpoint to GitHub...")
    
    try:
        # Read the local file content
        with open(FILE_PATH, "r") as f:
            file_content = f.read()
        
        print(f"✅ Read file: {FILE_PATH}")
        
        # Check if file exists on GitHub
        current_sha = get_current_file_sha(REPO_OWNER, REPO_NAME, FILE_PATH, BRANCH)
        
        if current_sha:
            print(f"📝 File exists, updating...")
        else:
            print(f"✨ Creating new file...")
        
        # Create or update the file
        result = update_file(
            REPO_OWNER,
            REPO_NAME,
            FILE_PATH,
            BRANCH,
            COMMIT_MESSAGE,
            file_content,
            current_sha,
            GITHUB_USERNAME,
            GITHUB_EMAIL
        )
        
        print("✅ File deployed successfully to GitHub!")
        print(f"Commit SHA: {result['commit']['sha']}")
        print(f"View commit: {result['commit']['html_url']}")
        print("")
        print("🔄 Vercel should automatically deploy this change...")
        print("   Check: https://vercel.com/george-pierces-projects/ntca/deployments")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to deploy file: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
    except FileNotFoundError:
        print(f"❌ Error: File not found at {FILE_PATH}")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()

