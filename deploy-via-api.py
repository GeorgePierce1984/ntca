#!/usr/bin/env python3

import os
import base64
import json
import urllib.request
import urllib.parse

def update_file_on_github():
    """Update the footer file directly via GitHub API"""
    
    # GitHub API details
    repo_owner = "rogit85"
    repo_name = "ntca"
    token = os.getenv("GITHUB_TOKEN", "")
    
    # File to update
    file_path = "src/components/layout/Footer.tsx"
    
    # Read the updated file content
    try:
        with open(file_path, 'r') as f:
            new_content = f.read()
    except FileNotFoundError:
        print(f"❌ File {file_path} not found")
        return False
    
    # Encode content to base64
    content_bytes = new_content.encode('utf-8')
    content_b64 = base64.b64encode(content_bytes).decode('utf-8')
    
    # GitHub API URL
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{file_path}"
    
    # Create request
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }
    
    # First, get the current file to get the SHA
    get_req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(get_req) as response:
            file_data = json.loads(response.read().decode())
            current_sha = file_data['sha']
    except Exception as e:
        print(f"❌ Failed to get current file: {e}")
        return False
    
    # Prepare update data
    update_data = {
        "message": "Update footer: change copyright to 2025 and remove heart emoji",
        "committer": {
            "name": "George Pierce",
            "email": "georgepierce@hotmail.co.uk"
        },
        "content": content_b64,
        "sha": current_sha
    }
    
    # Create update request
    data = json.dumps(update_data).encode('utf-8')
    put_req = urllib.request.Request(url, data=data, headers=headers, method='PUT')
    
    try:
        with urllib.request.urlopen(put_req) as response:
            result = json.loads(response.read().decode())
            print("✅ File updated successfully on GitHub!")
            print(f"📝 Commit SHA: {result['commit']['sha']}")
            print(f"🔗 Commit URL: {result['commit']['html_url']}")
            return True
    except Exception as e:
        print(f"❌ Failed to update file: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Updating footer on GitHub via API...")
    success = update_file_on_github()
    if success:
        print("🎉 Deployment complete!")
    else:
        print("❌ Deployment failed!")
