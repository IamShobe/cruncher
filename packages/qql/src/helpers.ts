// remove backticks from the string
// if backtick is escaped, then keep it
export const unquoteBacktick = (input: string) => {
  return input.replace(/\\`/g, "`").slice(1, -1);
};

export const parseDoubleQuotedString = (input: string): string => {
  // replace new line characters with escape sequences
  const value = input.replace(/\n/g, "\\n");
  // remove the double quotes from the string
  return JSON.parse(value);
};

export const parseSingleQuotedString = (input: string): string => {
  return input.slice(1, -1);
};

export function isNumeric(value: string) {
  return /^-?\d+(?:\.\d+)?$/.test(value);
}
