import { Badge, Box, Card, HStack, Icon, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import {
  LuCode,
  LuSettings2,
  LuSquareFunction,
  LuTag,
  LuToggleLeft,
  LuWrench,
} from "react-icons/lu";

export type Suggestion = {
  type:
    | "keyword"
    | "function"
    | "booleanFunction"
    | "variable"
    | "param"
    | "controllerParam";
  value: string;
  fromPosition: number;
  toPosition?: number;
};

const SUGGESTION_PRIORITY: Partial<Record<Suggestion["type"], number>> = {
  keyword: 0,
  function: 1,
  param: 2,
  controllerParam: 3,
  booleanFunction: 4,
  variable: 5,
};

export const compareSuggestions = (a: Suggestion, b: Suggestion): number => {
  const pa = SUGGESTION_PRIORITY[a.type] ?? 99;
  const pb = SUGGESTION_PRIORITY[b.type] ?? 99;
  return pa - pb;
};

export function fuzzyMatch(
  text: string,
  query: string,
): { matched: boolean; indices: number[] } {
  if (!query) return { matched: true, indices: [] };
  const indices: number[] = [];
  let qi = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) {
    if (text[i].toLowerCase() === query[qi].toLowerCase()) {
      indices.push(i);
      qi++;
    }
  }
  return { matched: qi === query.length, indices };
}

export type AutoCompleterProps = {
  suggestions: Suggestion[];
  hoveredItem?: number;
  writtenWord?: string;
};

type SuggestionMeta = {
  icon: React.ElementType;
  colorPalette: string;
  label: string;
};

const SUGGESTION_META: Record<Suggestion["type"], SuggestionMeta> = {
  keyword: { icon: LuCode, colorPalette: "purple", label: "keyword" },
  function: { icon: LuSquareFunction, colorPalette: "blue", label: "fn" },
  booleanFunction: { icon: LuToggleLeft, colorPalette: "blue", label: "fn" },
  variable: { icon: LuTag, colorPalette: "green", label: "field" },
  param: { icon: LuSettings2, colorPalette: "orange", label: "param" },
  controllerParam: { icon: LuWrench, colorPalette: "orange", label: "param" },
};

const HighlightedValue = ({
  value,
  query,
  colorPalette,
  isActive,
}: {
  value: string;
  query: string;
  colorPalette: string;
  isActive: boolean;
}) => {
  const valueToMatch =
    value.startsWith('"') && !query.startsWith('"')
      ? value.slice(1, -1)
      : value;
  const offset = value.startsWith('"') && !query.startsWith('"') ? 1 : 0;

  if (!query) {
    return <>{value}</>;
  }

  const { indices } = fuzzyMatch(valueToMatch, query);
  const matchSet = new Set(indices.map((i) => i + offset));

  return (
    <>
      {value.split("").map((char, i) => {
        if (matchSet.has(i)) {
          return (
            <Text
              key={i}
              as="span"
              color={isActive ? `${colorPalette}.fg` : `${colorPalette}.500`}
              fontWeight="semibold"
            >
              {char}
            </Text>
          );
        }
        return (
          <Text key={i} as="span" color="fg.muted">
            {char}
          </Text>
        );
      })}
    </>
  );
};

export const AutoCompleter = ({
  suggestions,
  hoveredItem,
  writtenWord = "",
}: AutoCompleterProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollerRef.current || hoveredItem === undefined) return;
    const element = scrollerRef.current.children[hoveredItem];
    if (!element) return;
    element.scrollIntoView({ block: "nearest" });
  }, [hoveredItem]);

  if (suggestions.length === 0) return null;

  return (
    <Card.Root
      minW="180px"
      maxW="280px"
      overflow="hidden"
      bg="bg"
      borderWidth="1px"
      borderColor="border"
      shadow="lg"
    >
      <Box ref={scrollerRef} p="1" overflow="auto" maxH="192px">
        {suggestions.map((suggestion, index) => {
          const meta = SUGGESTION_META[suggestion.type];
          const isActive = hoveredItem === index;
          return (
            <HStack
              key={index}
              px="2"
              py="1"
              gap="2"
              borderRadius="sm"
              bg={isActive ? "colorPalette.subtle" : "transparent"}
              colorPalette={isActive ? meta.colorPalette : undefined}
              align="center"
            >
              <Icon
                as={meta.icon}
                boxSize="3"
                color={`${meta.colorPalette}.fg`}
                flexShrink={0}
              />
              <Text
                fontSize="xs"
                fontFamily="mono"
                flex={1}
                truncate
                lineHeight="1"
              >
                <HighlightedValue
                  value={suggestion.value}
                  query={writtenWord}
                  colorPalette={meta.colorPalette}
                  isActive={isActive}
                />
              </Text>
              <Badge
                size="xs"
                variant="subtle"
                colorPalette={meta.colorPalette}
                flexShrink={0}
              >
                {meta.label}
              </Badge>
            </HStack>
          );
        })}
      </Box>
    </Card.Root>
  );
};
