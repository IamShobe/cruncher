/**
 * QQLLexer — pure lexer grammar for QQL (Quick Query Language).
 * Referenced by parser grammar QQL.g4 via tokenVocab = QQLLexer.
 */

lexer grammar QQLLexer;

// ==================== FRAGMENTS ====================

fragment ESC_SEQUENCE  : '\\' . ;
fragment DQUOT_BODY    : (~[\\"] | ESC_SEQUENCE)* ;
fragment SQUOT_BODY    : (~[\\'] | ESC_SEQUENCE)* ;
fragment BACKTICK_BODY : (~[`\\] | ESC_SEQUENCE)* ;

// ==================== KEYWORDS (must precede IDENTIFIER) ====================

TABLE     : 'table' ;
STATS     : 'stats' ;
WHERE     : 'where' ;
SORT      : 'sort' ;
EVAL      : 'eval' ;
REGEX     : 'regex' ;
FIELD     : 'field' ;
TIMECHART : 'timechart' ;
UNPACK    : 'unpack' ;
AS        : 'as' ;
BY        : 'by' ;
SPAN      : 'span' ;
TIMECOL   : 'timeCol' ;
MAXGROUPS : 'maxGroups' ;
ASC       : 'asc' ;
DESC      : 'desc' ;
IN        : 'in' ;
TRUE      : 'true' ;
FALSE     : 'false' ;
IF        : 'if' ;
CASE      : 'case' ;
SEARCH_AND : 'AND' ;
SEARCH_OR  : 'OR' ;

// ==================== OPERATORS AND PUNCTUATION ====================

PIPE          : '|' ;
COMMA         : ',' ;
LPAREN        : '(' ;
RPAREN        : ')' ;
LBRACKET      : '[' ;
RBRACKET      : ']' ;
EQUAL_EQUAL   : '==' ;
EQUAL         : '=' ;
NOT_EQUAL     : '!=' ;
GREATER_EQUAL : '>=' ;
LESS_EQUAL    : '<=' ;
GREATER_THAN  : '>' ;
LESS_THAN     : '<' ;
AND           : '&&' ;
OR            : '||' ;
NOT           : '!' ;
PLUS          : '+' ;
MINUS         : '-' ;
MULTIPLY      : '*' ;
DIVIDE        : '/' ;

// ==================== LITERALS ====================

AT_DATASOURCE : '@' [a-zA-Z_] [0-9a-zA-Z_-]* ;

DQUOT_STRING  : '"' DQUOT_BODY '"' ;
SQUOT_STRING  : '\'' SQUOT_BODY '\'' ;
REGEX_PATTERN : '`' BACKTICK_BODY '`' ;

// FLOAT must be before INTEGER so '3.14' matches FLOAT (longest match)
FLOAT   : ('0' | [1-9][0-9]*) '.' [0-9]+ ;
INTEGER : '0' | [1-9] [0-9]* ;

// Dots and hyphens allowed in middle/end for field names like kubernetes.pod_name
IDENTIFIER : [0-9a-zA-Z_] [0-9a-zA-Z_.-]* ;

// ==================== WHITESPACE / COMMENTS ====================

WS      : [ \t\r\n]+ -> skip ;
COMMENT : '//' ~[\r\n]* -> channel(HIDDEN) ;
