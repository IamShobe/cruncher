/**
 * QQL (Quick Query Language) - ANTLR4 Grammar
 *
 * A domain-specific query language for Cruncher platform.
 */

grammar QQL;

// ==================== PARSER RULES ====================

query
  : datasource* controllerParam* search pipelineCommand*
  ;

datasource
  : AT_DATASOURCE
  ;

controllerParam
  : IDENTIFIER EQUAL (literalString | regexLiteral)
  ;

search
  : searchFactor searchTail?
  ;

searchTail
  : SEARCH_AND search
  | SEARCH_OR search
  ;

searchFactor
  : searchLiteral (SEARCH_PARAM_NEQ searchLiteral)?
  ;

searchLiteral
  : (IDENTIFIER | INTEGER | literalString)+
  ;

pipelineCommand
  : PIPE (tableCmd | statsCmd | whereCmd | sortCmd | evalCmd | regexCmd | timechartCmd | unpackCmd)
  ;

tableCmd
  : TABLE tableColumn (COMMA tableColumn)*
  ;

tableColumn
  : IDENTIFIER (AS IDENTIFIER)?
  ;

statsCmd
  : STATS aggregationFunction (COMMA aggregationFunction)* (BY groupby)?
  ;

aggregationFunction
  : IDENTIFIER (LPAREN IDENTIFIER? RPAREN)? (AS IDENTIFIER)?
  ;

groupby
  : IDENTIFIER (COMMA IDENTIFIER)*
  ;

whereCmd
  : WHERE logicalExpression
  ;

sortCmd
  : SORT sortColumn (COMMA sortColumn)*
  ;

sortColumn
  : IDENTIFIER (ASC | DESC)?
  ;

evalCmd
  : EVAL evalExpression (COMMA evalExpression)*
  ;

evalExpression
  : IDENTIFIER EQUAL evalFunctionArg
  ;

regexCmd
  : REGEX FIELD regexLiteral
  ;

timechartCmd
  : TIMECHART aggregationFunction (COMMA aggregationFunction)* timechartParams* (BY groupby)?
  ;

timechartParams
  : SPAN IDENTIFIER
  | TIMECOL IDENTIFIER
  | MAXGROUPS INTEGER
  ;

unpackCmd
  : UNPACK IDENTIFIER
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
  : factor
  | logicalExpression
  | evalFunction
  | calcExpression
  | functionExpression
  ;

evalFunction
  : IF LPAREN logicalExpression RPAREN evalFunctionArg (ELSE evalFunctionArg)?
  | CASE caseThen+ (ELSE evalFunctionArg)?
  ;

caseThen
  : IF LPAREN logicalExpression RPAREN evalFunctionArg
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

// String literals
DQUOT_STRING
  : '"' (~["\\\r\n] | '\\' [btnrtv"\\/ ])* '"'
  ;

SQUOT_STRING
  : '\'' (~['\\\r\n] | '\\' [btnrtv'\\/ ])* '\''
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
