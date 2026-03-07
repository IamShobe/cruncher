#!/usr/bin/env bash
set -e

LOCAL_REGISTRY="http://localhost:4873"

echo "Clearing local registry storage..."
rm -rf tmp/local-registry/storage

echo "Building packages..."
pnpm turbo run build --filter='./packages/**'

echo "Publishing to local registry..."
pnpm -r --filter='./packages/**' publish --registry "${LOCAL_REGISTRY}" --no-git-checks

echo ""
echo "Done! Check ${LOCAL_REGISTRY} to verify."
