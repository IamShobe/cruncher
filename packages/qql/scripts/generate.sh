#!/usr/bin/env bash
# Regenerate ANTLR4 TypeScript files from QQLLexer.g4 + QQL.g4.
# Output goes directly into src/generated/ (no extra src/ subdirectory).
# Tokens file is copied to the grammar directory so tokenVocab lookup works,
# then cleaned up when done.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SYNTAX_DIR="$PACKAGE_DIR/src/syntax"
ANTLR="$PACKAGE_DIR/node_modules/.bin/antlr4ng"

ANTLR_FLAGS="-Dlanguage=TypeScript -visitor -no-listener -Xexact-output-dir"

# Skip generation if neither grammar file is newer than the generated output
SENTINEL="$SYNTAX_DIR/QQL.ts"
if [ -f "$SENTINEL" ] \
   && [ ! "$SYNTAX_DIR/QQLLexer.g4" -nt "$SENTINEL" ] \
   && [ ! "$SYNTAX_DIR/QQL.g4" -nt "$SENTINEL" ]; then
  echo "Grammar unchanged, skipping generation."
  exit 0
fi

# Grammar files and generated output all live flat in src/syntax/.
# ANTLR writes QQLLexer.tokens next to QQLLexer.g4 so tokenVocab lookup
# for QQL.g4 works without any copying.
echo "Cleaning generated files in $SYNTAX_DIR..."
rm -f "$SYNTAX_DIR"/*.ts "$SYNTAX_DIR"/*.interp "$SYNTAX_DIR"/*.tokens

echo "Generating lexer grammar (QQLLexer.g4)..."
"$ANTLR" $ANTLR_FLAGS -o "$SYNTAX_DIR" "$SYNTAX_DIR/QQLLexer.g4"

echo "Generating parser grammar (QQL.g4)..."
"$ANTLR" $ANTLR_FLAGS -o "$SYNTAX_DIR" "$SYNTAX_DIR/QQL.g4"

echo "Done. Generated files:"
ls "$SYNTAX_DIR"
