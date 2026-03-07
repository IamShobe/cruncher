/**
 * QQLLexer — context-sensitive lexer grammar for QQL.
 *
 * Strategy: lexer modes eliminate keyword/identifier ambiguity.
 *
 *   DEFAULT_MODE  — preamble (datasources, controller params, search terms).
 *                   Expression keywords (by, as, if, case, …) are plain IDENTIFIER.
 *   COMMAND_MODE  — entered after '|'; recognises command keywords and switches
 *                   to the appropriate sub-mode.
 *   TABLE_MODE    — 'as' keyword + identifiers
 *   STATS_MODE    — 'as', 'by' keywords + function-call tokens
 *   SORT_MODE     — 'asc', 'desc' keywords + identifiers
 *   EXPR_MODE     — after 'where': comparison/logical operators, 'in', true, false
 *   EVAL_MODE     — after 'eval':  EXPR_MODE + 'if', 'case', '=' (assignment)
 *   TIMECHART_MODE— 'as', 'by', 'span', 'timeCol', 'maxGroups' keywords
 *   REGEX_MODE    — 'field' keyword + regex patterns
 *   FIELD_MODE    — after 'unpack': identifiers only
 */

lexer grammar QQLLexer;

// ─── Shared fragments ─────────────────────────────────────────────────────────

fragment ESC    : '\\' . ;
fragment DQBODY : (~[\\"] | ESC)* ;
fragment SQBODY : (~[\\'] | ESC)* ;
fragment BTBODY : (~[`\\] | ESC)* ;
// Identifiers allow leading digits and dots/hyphens for field names like
// kubernetes.pod_name or 5m (span values).
fragment ID_CHAR : [0-9a-zA-Z_] ;
fragment ID_REST : [0-9a-zA-Z_.\-] ;

// ─── DEFAULT MODE — preamble ──────────────────────────────────────────────────

// Switching to COMMAND_MODE (not push) is intentional: the preamble never
// resumes after the first pipe — pipeline commands follow until EOF.
PIPE          : '|'                   -> mode(COMMAND_MODE) ;

COMMA         : ',' ;
LPAREN        : '(' ;
RPAREN        : ')' ;
// '==' before '=' so longest-match wins
EQUAL_EQUAL   : '==' ;
EQUAL         : '=' ;
// '!=' before any single-char token starting with '!'
NOT_EQUAL     : '!=' ;

AT_DATASOURCE : '@' [a-zA-Z_] [0-9a-zA-Z_\-]* ;
DQUOT_STRING  : '"'  DQBODY '"' ;
SQUOT_STRING  : '\'' SQBODY '\'' ;
REGEX_PATTERN : '`'  BTBODY '`' ;

// Search combinator keywords (uppercase, only in preamble search)
SEARCH_AND    : 'AND' ;
SEARCH_OR     : 'OR'  ;

// Literals — FLOAT before INTEGER so '3.14' is a single token
FLOAT         : (ID_CHAR+ '.' [0-9]+) ;
INTEGER       : '0' | [1-9][0-9]* ;
// IDENTIFIER last: lowest priority, matched when nothing else fits
IDENTIFIER    : ID_CHAR ID_REST* ;

WS            : [ \t\r\n]+ -> skip ;
COMMENT       : '//' ~[\r\n]* -> channel(HIDDEN) ;

// ─── COMMAND_MODE — immediately after '|' ────────────────────────────────────

mode COMMAND_MODE;

// Each keyword transitions to the mode that knows its argument syntax.
TABLE     : 'table'     -> mode(TABLE_MODE)      ;
STATS     : 'stats'     -> mode(STATS_MODE)      ;
WHERE     : 'where'     -> mode(EXPR_MODE)       ;
SORT      : 'sort'      -> mode(SORT_MODE)       ;
EVAL      : 'eval'      -> mode(EVAL_MODE)       ;
REGEX     : 'regex'     -> mode(REGEX_MODE)      ;
TIMECHART : 'timechart' -> mode(TIMECHART_MODE)  ;
UNPACK    : 'unpack'    -> mode(FIELD_MODE)      ;

CM_WS     : [ \t\r\n]+ -> skip ;
CM_CMT    : '//' ~[\r\n]* -> channel(HIDDEN) ;
// Unknown command keyword — surface as IDENTIFIER so the parser can report a
// useful error rather than an unrecognised-token crash.
CM_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── TABLE_MODE — after 'table' ───────────────────────────────────────────────
// Tokens: column names, optional AS alias, commas, quoted strings, next pipe.

mode TABLE_MODE;

AS          : 'as' ;
TBL_PIPE    : '|'             -> type(PIPE),         mode(COMMAND_MODE) ;
TBL_COMMA   : ','             -> type(COMMA) ;
TBL_DQSTR   : '"'  DQBODY '"' -> type(DQUOT_STRING) ;
TBL_SQSTR   : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
TBL_WS      : [ \t\r\n]+      -> skip ;
TBL_CMT     : '//' ~[\r\n]*   -> channel(HIDDEN) ;
TBL_ID      : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── STATS_MODE — after 'stats' ───────────────────────────────────────────────
// Tokens: agg function names, AS alias, BY groupby, parens, commas.

mode STATS_MODE;

ST_AS     : 'as'            -> type(AS) ;
BY        : 'by' ;
ST_PIPE   : '|'             -> type(PIPE),         mode(COMMAND_MODE) ;
ST_COMMA  : ','             -> type(COMMA) ;
ST_LPAREN : '('             -> type(LPAREN) ;
ST_RPAREN : ')'             -> type(RPAREN) ;
ST_DQSTR  : '"'  DQBODY '"' -> type(DQUOT_STRING) ;
ST_SQSTR  : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
ST_WS     : [ \t\r\n]+      -> skip ;
ST_CMT    : '//' ~[\r\n]*   -> channel(HIDDEN) ;
ST_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── SORT_MODE — after 'sort' ─────────────────────────────────────────────────
// Tokens: column names, optional ASC/DESC, commas.

mode SORT_MODE;

ASC       : 'asc' ;
DESC      : 'desc' ;
SO_PIPE   : '|'             -> type(PIPE),         mode(COMMAND_MODE) ;
SO_COMMA  : ','             -> type(COMMA) ;
SO_DQSTR  : '"'  DQBODY '"' -> type(DQUOT_STRING) ;
SO_SQSTR  : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
SO_WS     : [ \t\r\n]+      -> skip ;
SO_CMT    : '//' ~[\r\n]*   -> channel(HIDDEN) ;
SO_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── EXPR_MODE — after 'where' ────────────────────────────────────────────────
// Full boolean/comparison expression.  'by', 'as', 'asc', 'desc' stay as
// plain IDENTIFIER so field names like `where by == 1` work naturally.

mode EXPR_MODE;

IN        : 'in' ;
TRUE      : 'true' ;
FALSE     : 'false' ;
// Logical operators
AND       : '&&' ;
OR        : '||' ;
NOT       : '!'  ;
// Comparison operators — longest match first
EX_EQ2    : '=='  -> type(EQUAL_EQUAL) ;
EX_NEQ    : '!='  -> type(NOT_EQUAL) ;
EX_GEQ    : '>='  -> type(GREATER_EQUAL) ;
EX_LEQ    : '<='  -> type(LESS_EQUAL) ;
EX_GT     : '>'   -> type(GREATER_THAN) ;
EX_LT     : '<'   -> type(LESS_THAN) ;
// Arithmetic (used in nested calcExpression via functionArg)
EX_PLUS   : '+'   -> type(PLUS) ;
EX_MINUS  : '-'   -> type(MINUS) ;
EX_MUL    : '*'   -> type(MULTIPLY) ;
EX_DIV    : '/'   -> type(DIVIDE) ;
EX_PIPE   : '|'              -> type(PIPE),         mode(COMMAND_MODE) ;
EX_COMMA  : ','              -> type(COMMA) ;
EX_LPAREN : '('              -> type(LPAREN) ;
EX_RPAREN : ')'              -> type(RPAREN) ;
EX_LBRACK : '['              -> type(LBRACKET) ;
EX_RBRACK : ']'              -> type(RBRACKET) ;
EX_DQSTR  : '"'  DQBODY '"'  -> type(DQUOT_STRING) ;
EX_SQSTR  : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
EX_REPAT  : '`'  BTBODY '`'  -> type(REGEX_PATTERN) ;
EX_FLOAT  : ID_CHAR+ '.' [0-9]+ -> type(FLOAT) ;
EX_INT    : ('0' | [1-9][0-9]*) -> type(INTEGER) ;
EX_WS     : [ \t\r\n]+       -> skip ;
EX_CMT    : '//' ~[\r\n]*    -> channel(HIDDEN) ;
EX_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── EVAL_MODE — after 'eval' ─────────────────────────────────────────────────
// Same as EXPR_MODE plus: IF, CASE, and '=' for the assignment lhs = rhs.

mode EVAL_MODE;

IF        : 'if' ;
CASE      : 'case' ;
EV_IN     : 'in'   -> type(IN) ;
EV_TRUE   : 'true' -> type(TRUE) ;
EV_FALSE  : 'false'-> type(FALSE) ;
EV_AND    : '&&'   -> type(AND) ;
EV_OR     : '||'   -> type(OR) ;
EV_NOT    : '!'    -> type(NOT) ;
// '==' and '!=' must be before '=' and '!' (longest-match)
EV_EQ2    : '=='   -> type(EQUAL_EQUAL) ;
EV_NEQ    : '!='   -> type(NOT_EQUAL) ;
EV_EQ     : '='    -> type(EQUAL) ;
EV_GEQ    : '>='   -> type(GREATER_EQUAL) ;
EV_LEQ    : '<='   -> type(LESS_EQUAL) ;
EV_GT     : '>'    -> type(GREATER_THAN) ;
EV_LT     : '<'    -> type(LESS_THAN) ;
EV_PLUS   : '+'    -> type(PLUS) ;
EV_MINUS  : '-'    -> type(MINUS) ;
EV_MUL    : '*'    -> type(MULTIPLY) ;
EV_DIV    : '/'    -> type(DIVIDE) ;
EV_PIPE   : '|'              -> type(PIPE),         mode(COMMAND_MODE) ;
EV_COMMA  : ','              -> type(COMMA) ;
EV_LPAREN : '('              -> type(LPAREN) ;
EV_RPAREN : ')'              -> type(RPAREN) ;
EV_LBRACK : '['              -> type(LBRACKET) ;
EV_RBRACK : ']'              -> type(RBRACKET) ;
EV_DQSTR  : '"'  DQBODY '"'  -> type(DQUOT_STRING) ;
EV_SQSTR  : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
EV_REPAT  : '`'  BTBODY '`'  -> type(REGEX_PATTERN) ;
EV_FLOAT  : ID_CHAR+ '.' [0-9]+ -> type(FLOAT) ;
EV_INT    : ('0' | [1-9][0-9]*) -> type(INTEGER) ;
EV_WS     : [ \t\r\n]+       -> skip ;
EV_CMT    : '//' ~[\r\n]*    -> channel(HIDDEN) ;
EV_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── TIMECHART_MODE — after 'timechart' ───────────────────────────────────────
// Superset of STATS_MODE: adds span/timeCol/maxGroups params.

mode TIMECHART_MODE;

SPAN      : 'span' ;
TIMECOL   : 'timeCol' ;
MAXGROUPS : 'maxGroups' ;
TC_AS     : 'as'            -> type(AS) ;
TC_BY     : 'by'            -> type(BY) ;
TC_PIPE   : '|'             -> type(PIPE),         mode(COMMAND_MODE) ;
TC_COMMA  : ','             -> type(COMMA) ;
TC_LPAREN : '('             -> type(LPAREN) ;
TC_RPAREN : ')'             -> type(RPAREN) ;
// '=' used in optional `span=5m` / `timeCol=field` / `maxGroups=N` syntax
TC_EQ     : '='             -> type(EQUAL) ;
TC_FLOAT  : ID_CHAR+ '.' [0-9]+ -> type(FLOAT) ;
TC_INT    : ('0' | [1-9][0-9]*) -> type(INTEGER) ;
TC_DQSTR  : '"'  DQBODY '"'  -> type(DQUOT_STRING) ;
TC_SQSTR  : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
TC_WS     : [ \t\r\n]+      -> skip ;
TC_CMT    : '//' ~[\r\n]*   -> channel(HIDDEN) ;
TC_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── REGEX_MODE — after 'regex' ───────────────────────────────────────────────

mode REGEX_MODE;

FIELD     : 'field' ;
RX_EQ     : '='             -> type(EQUAL) ;
RX_PIPE   : '|'             -> type(PIPE),         mode(COMMAND_MODE) ;
RX_PAT    : '`'  BTBODY '`' -> type(REGEX_PATTERN) ;
RX_DQSTR  : '"'  DQBODY '"' -> type(DQUOT_STRING) ;
RX_SQSTR  : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
RX_WS     : [ \t\r\n]+      -> skip ;
RX_CMT    : '//' ~[\r\n]*   -> channel(HIDDEN) ;
RX_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── FIELD_MODE — after 'unpack' (single identifier or quoted string) ─────────

mode FIELD_MODE;

FL_PIPE   : '|'             -> type(PIPE),         mode(COMMAND_MODE) ;
FL_DQSTR  : '"'  DQBODY '"' -> type(DQUOT_STRING) ;
FL_SQSTR  : '\'' SQBODY '\'' -> type(SQUOT_STRING) ;
FL_WS     : [ \t\r\n]+      -> skip ;
FL_CMT    : '//' ~[\r\n]*   -> channel(HIDDEN) ;
FL_ID     : ID_CHAR ID_REST* -> type(IDENTIFIER) ;

// ─── Tokens defined only via aliases above — declared here so antlr4ng
//     generates them in the vocabulary even if never the "canonical" rule.
//     (antlr4ng-cli infers them from -> type() references, but explicit
//      declarations make the .tokens file stable across regenerations.)
LBRACKET      : '[' ;   // canonical; only reachable in EXPR/EVAL modes via aliases
RBRACKET      : ']' ;
GREATER_EQUAL : '>=' ;
LESS_EQUAL    : '<=' ;
GREATER_THAN  : '>' ;
LESS_THAN     : '<' ;
PLUS          : '+' ;
MINUS         : '-' ;
MULTIPLY      : '*' ;
DIVIDE        : '/' ;
