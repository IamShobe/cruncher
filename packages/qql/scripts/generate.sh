#!/usr/bin/env bash
# Regenerate ANTLR4 TypeScript files from QQLLexer.g4 + QQL.g4.
# Output goes directly into src/generated/ (no extra src/ subdirectory).
# Tokens file is copied to the grammar directory so tokenVocab lookup works,
# then cleaned up when done.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$PACKAGE_DIR/src"
GENERATED_DIR="$SRC_DIR/generated"
ANTLR="$PACKAGE_DIR/node_modules/.bin/antlr4ng"

ANTLR_FLAGS="-Dlanguage=TypeScript -visitor -no-listener"

echo "Cleaning $GENERATED_DIR..."
rm -rf "$GENERATED_DIR"
mkdir -p "$GENERATED_DIR"

echo "Generating lexer grammar (QQLLexer.g4)..."
"$ANTLR" $ANTLR_FLAGS -o "$GENERATED_DIR" "$SRC_DIR/QQLLexer.g4"

# tokenVocab lookup: ANTLR4 looks for the .tokens file in the grammar file's
# own directory, so copy it there temporarily.
cp "$GENERATED_DIR/QQLLexer.tokens" "$SRC_DIR/QQLLexer.tokens"

echo "Generating parser grammar (QQL.g4)..."
"$ANTLR" $ANTLR_FLAGS -o "$GENERATED_DIR" "$SRC_DIR/QQL.g4"

rm -f "$SRC_DIR/QQLLexer.tokens"

echo "Done. Generated files:"
ls "$GENERATED_DIR"
