/**
 * QQL (Quick Query Language) — parser grammar.
 * Lexer vocabulary is defined in QQLLexer.g4.
 */

parser grammar QQL;

options { tokenVocab = QQLLexer; }

// ==================== PARSER RULES ====================

query
  : datasource* controllerParam* search? pipelineCommand* EOF
  ;

datasource
  : AT_DATASOURCE
  ;

controllerParam
  : IDENTIFIER (EQUAL | NOT_EQUAL) (literalString | regexLiteral)
  ;

search
  : searchTerm searchTail?
  ;

searchTail
  : SEARCH_AND search
  | SEARCH_OR search
  ;

searchTerm
  : LPAREN search RPAREN
  | searchFactor
  ;

searchFactor
  : searchLiteral (NOT_EQUAL searchLiteral)?
  ;

searchLiteral
  : (IDENTIFIER | FLOAT | INTEGER | literalString | keyword)+
  ;

pipelineCommand
  : PIPE (tableCmd | statsCmd | whereCmd | sortCmd | evalCmd | regexCmd | timechartCmd | unpackCmd)
  ;

tableCmd
  : TABLE tableColumn (COMMA? tableColumn)*
  ;

tableColumn
  : identifierOrString (AS identifierOrString)?
  ;

statsCmd
  : STATS aggregationFunction (COMMA? aggregationFunction)* (BY groupby)?
  ;

aggregationFunction
  : identifierOrString (LPAREN identifierOrString? RPAREN)? (AS identifierOrString)?
  ;

groupby
  : identifierOrString (COMMA? identifierOrString)*
  ;

whereCmd
  : WHERE logicalExpression
  ;

sortCmd
  : SORT sortColumn (COMMA? sortColumn)*
  ;

sortColumn
  : identifierOrString (ASC | DESC)?
  ;

evalCmd
  : EVAL evalExpression
  ;

evalExpression
  : identifierOrString EQUAL evalFunctionArg
  ;

regexCmd
  : REGEX (FIELD EQUAL identifierOrString)? regexLiteral
  ;

timechartCmd
  : TIMECHART aggregationFunction (COMMA? aggregationFunction)* timechartParams* (BY groupby)?
  ;

timechartParams
  : SPAN identifierOrString
  | TIMECOL identifierOrString
  | MAXGROUPS INTEGER
  ;

unpackCmd
  : UNPACK identifierOrString
  ;

// ==================== EXPRESSION RULES ====================

logicalExpression
  : unitExpression logicalTail*
  ;

logicalTail
  : AND logicalExpression
  | OR logicalExpression
  ;

unitExpression
  : (inArrayExpression | comparisonExpression | notExpression | functionExpression)
  | LPAREN logicalExpression RPAREN
  ;

notExpression
  : NOT unitExpression
  ;

inArrayExpression
  : factor IN LBRACKET factor (COMMA factor)* RBRACKET
  ;

comparisonExpression
  : factor (EQUAL_EQUAL | NOT_EQUAL | GREATER_EQUAL | LESS_EQUAL | GREATER_THAN | LESS_THAN) factor
  ;

functionExpression
  : IDENTIFIER LPAREN functionArgs? RPAREN
  ;

functionArgs
  : functionArg (COMMA functionArg)*
  ;

functionArg
  : factor
  | regexLiteral
  | logicalExpression
  | functionExpression
  ;

evalFunctionArg
  : evalFunction
  | functionExpression
  | logicalExpression
  | calcExpression
  ;

evalFunction
  : IF LPAREN logicalExpression COMMA evalFunctionArg (COMMA evalFunctionArg)? RPAREN
  | CASE LPAREN caseThen (COMMA evalFunctionArg)? RPAREN
  ;

caseThen
  : logicalExpression COMMA evalFunctionArg
  ;

calcExpression
  : calcTerm calcAction*
  ;

calcAction
  : PLUS calcTerm
  | MINUS calcTerm
  ;

calcTerm
  : calculateUnit calcTermAction*
  ;

calcTermAction
  : MULTIPLY calculateUnit
  | DIVIDE calculateUnit
  ;

calculateUnit
  : factor
  | LPAREN calcExpression RPAREN
  ;

factor
  : literalString
  | FLOAT
  | INTEGER
  | IDENTIFIER
  | keyword
  | literalBoolean
  ;

literalBoolean
  : TRUE
  | FALSE
  ;

literalString
  : DQUOT_STRING
  | SQUOT_STRING
  ;

regexLiteral
  : REGEX_PATTERN
  ;

identifierOrString
  : IDENTIFIER
  | DQUOT_STRING
  | SQUOT_STRING
  | keyword
  ;

// Command keywords — only meaningful immediately after a pipe.
// Safe to allow as column/field names everywhere else because they never
// appear in expression positions (comparisons, groupby clauses, etc.).
// Expression-level keywords (BY, AS, IN, ASC, DESC, SPAN, TIMECOL, MAXGROUPS,
// IF, CASE) are intentionally excluded: they have specific infix/postfix roles
// that create LL ambiguities when also allowed as identifiers.
keyword
  : TABLE | STATS | WHERE | SORT | EVAL | REGEX | FIELD | TIMECHART | UNPACK
  ;
