#!/bin/bash
cd "$(dirname "$0")"
export PATH="$PWD/node-v20.11.0-darwin-x64/bin:$PATH"
node --input-type=module run-migration.js
