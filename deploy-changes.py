#!/usr/bin/env python3

import os
import subprocess
import sys

def run_command(cmd, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    # Set up the project directory
    project_dir = "/Users/georgepierce/Desktop/Projects/ntca/ntca"
    
    print("🚀 Deploying changes to GitHub...")
    
    # Check if git is available
    success, stdout, stderr = run_command("git --version", project_dir)
    if not success:
        print("❌ Git is not available. Please install Xcode command line tools first.")
        print("Run: xcode-select --install")
        return False
    
    # Set git user configuration
    print("📝 Setting up git configuration...")
    run_command('git config user.name "George Pierce"', project_dir)
    run_command('git config user.email "georgepierce@hotmail.co.uk"', project_dir)
    
    # Add all changes
    print("📁 Adding changes...")
    success, stdout, stderr = run_command("git add .", project_dir)
    if not success:
        print(f"❌ Failed to add changes: {stderr}")
        return False
    
    # Commit changes
    print("💾 Committing changes...")
    commit_message = "Update footer: change copyright to 2025 and remove heart emoji"
    success, stdout, stderr = run_command(f'git commit -m "{commit_message}"', project_dir)
    if not success:
        print(f"❌ Failed to commit: {stderr}")
        return False
    
    print("✅ Changes committed successfully!")
    print("📤 Note: To push to GitHub, you'll need to set up authentication.")
    print("You can either:")
    print("1. Install GitHub CLI: brew install gh && gh auth login")
    print("2. Use personal access token with: git push origin main")
    
    return True

if __name__ == "__main__":
    main()
