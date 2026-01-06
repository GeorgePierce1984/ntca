#!/bin/bash

# Setup script for NTCA project
# This script sets up the local environment with Node.js and npm

echo "Setting up NTCA project environment..."

# Set the PATH to include the local Node.js installation
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies already installed."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the development server:"
echo "  source setup-local-env.sh && npm run dev"
echo ""
echo "To build the project:"
echo "  source setup-local-env.sh && npm run build"
echo ""
echo "To install GitHub CLI (requires Xcode command line tools):"
echo "  brew install gh"
echo ""
echo "Current git configuration:"
echo "  Email: georgepierce@hotmail.co.uk"
echo "  Remote: https://github.com/rogit85/ntca.git"
