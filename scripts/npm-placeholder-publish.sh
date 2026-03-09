#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <package-name> [description]"
  echo "  Publishes a minimal placeholder to npm to claim the package name."
  echo "  After publishing, configure a trusted publisher at:"
  echo "  https://www.npmjs.com/package/<package-name>"
  exit 1
}

NAME="${1:-}"
DESCRIPTION="${2:-}"

[ -z "$NAME" ] && usage

[ -z "$DESCRIPTION" ] && DESCRIPTION="Placeholder package for ${NAME}"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$TMPDIR"

cat > package.json << EOF
{
  "name": "${NAME}",
  "version": "0.0.1",
  "description": "${DESCRIPTION}",
  "main": "index.js",
  "license": "GPL-3.0-only",
  "publishConfig": { "access": "public" },
  "repository": {
    "type": "git",
    "url": "https://github.com/IamShobe/cruncher"
  }
}
EOF

echo "// placeholder" > index.js

echo "Publishing placeholder for ${NAME}..."
npm publish --access public

echo ""
echo "Done! Configure trusted publisher at:"
echo "  https://www.npmjs.com/package/${NAME}"
