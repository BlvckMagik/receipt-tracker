#!/bin/bash

# Set CI environment
export CI=true

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build applications
echo "Building applications..."
pnpm build

# Start the API
echo "Starting API..."
cd apps/api
node dist/main.js
