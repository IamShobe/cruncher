/**
 * QQL (Quick Query Language) - ANTLR4 Grammar
 *
 * A domain-specific query language for Cruncher platform.
 */

grammar QQL;

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
  : (IDENTIFIER | INTEGER | literalString)+
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
  : REGEX FIELD regexLiteral
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
  | INTEGER
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

// ==================== LEXER RULES ====================

// Keywords - must come before IDENTIFIER
TABLE
  : 'table'
  ;

STATS
  : 'stats'
  ;

WHERE
  : 'where'
  ;

SORT
  : 'sort'
  ;

EVAL
  : 'eval'
  ;

REGEX
  : 'regex'
  ;

TIMECHART
  : 'timechart'
  ;

UNPACK
  : 'unpack'
  ;

AS
  : 'as'
  ;

BY
  : 'by'
  ;

SPAN
  : 'span'
  ;

TIMECOL
  : 'timeCol'
  ;

MAXGROUPS
  : 'maxGroups'
  ;

FIELD
  : 'field'
  ;

ASC
  : 'asc'
  ;

DESC
  : 'desc'
  ;

IN
  : 'in'
  ;

TRUE
  : 'true'
  ;

FALSE
  : 'false'
  ;

IF
  : 'if'
  ;

CASE
  : 'case'
  ;

ELSE
  : 'else'
  ;

SEARCH_AND
  : 'AND'
  ;

SEARCH_OR
  : 'OR'
  ;

// Operators and punctuation
PIPE
  : '|'
  ;

COMMA
  : ','
  ;

LPAREN
  : '('
  ;

RPAREN
  : ')'
  ;

LBRACKET
  : '['
  ;

RBRACKET
  : ']'
  ;

EQUAL
  : '='
  ;

EQUAL_EQUAL
  : '=='
  ;

NOT_EQUAL
  : '!='
  ;

GREATER_EQUAL
  : '>='
  ;

LESS_EQUAL
  : '<='
  ;

GREATER_THAN
  : '>'
  ;

LESS_THAN
  : '<'
  ;

AND
  : '&&'
  ;

OR
  : '||'
  ;

NOT
  : '!'
  ;

PLUS
  : '+'
  ;

MINUS
  : '-'
  ;

MULTIPLY
  : '*'
  ;

DIVIDE
  : '/'
  ;

SEARCH_PARAM_NEQ
  : '!='
  ;

AT_DATASOURCE
  : '@' [a-zA-Z_] [0-9a-zA-Z_-]*
  ;

// String literals (newlines allowed)
DQUOT_STRING
  : '"' (~[\\"] | '\\' .)* '"'
  ;

SQUOT_STRING
  : '\'' (~[\\'] | '\\' .)* '\''
  ;

REGEX_PATTERN
  : '`' (~[`\\] | '\\' .)* '`'
  ;

// Number
INTEGER
  : '0' | [1-9] [0-9]*
  ;

// Identifier (must be after keywords)
IDENTIFIER
  : [0-9a-zA-Z_] [0-9a-zA-Z_-]*
  ;

// Whitespace and comments
WS
  : [ \t\r\n]+ -> skip
  ;

COMMENT
  : '//' ~[\r\n]* -> channel(HIDDEN)
  ;
