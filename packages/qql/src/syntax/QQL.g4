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
  | searchFactor  // implicit AND: `(a OR b) more_terms`
  ;

searchTerm
  : LPAREN search RPAREN
  | searchFactor
  ;

searchFactor
  : searchLiteral (NOT_EQUAL searchLiteral)?
  ;

searchLiteral
  : (IDENTIFIER | FLOAT | INTEGER | literalString)+
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
  : identifierOrString (LPAREN aggFunctionArg? RPAREN)? (AS identifierOrString)?
  ;

// Argument inside an aggregation function: plain field or one level of function nesting.
// e.g. `avg(latency)` or `avg(abs(latency))`
aggFunctionArg
  : identifierOrString (LPAREN identifierOrString? RPAREN)?
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

// timechartCmd allows params to appear before, after, or between aggregations.
// The `=` separator in params is optional: `span 5m` and `span=5m` are both valid.
timechartCmd
  : TIMECHART timechartParams* aggregationFunction (COMMA? (aggregationFunction | timechartParams))* timechartParams* (BY groupby)?
  ;

timechartParams
  : SPAN EQUAL? identifierOrString
  | TIMECOL EQUAL? identifierOrString
  | MAXGROUPS EQUAL? INTEGER
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
  | factor  // bare factor as truthy boolean, e.g. `if(fieldName, ...)` or `where boolField`
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
  : calcExpression
  | regexLiteral
  | logicalExpression
  | functionExpression
  ;

// calcExpression must come before logicalExpression so that simple literals
// (strings, numbers, column refs) are treated as calc values rather than
// bare-factor logical expressions when the two alternatives are ambiguous.
evalFunctionArg
  : evalFunction
  | functionExpression
  | calcExpression
  | logicalExpression
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
  | functionExpression  // e.g. lower(x) used as operand in comparison
  | IDENTIFIER
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
  ;
