import { Badge, Box, Card, HStack, Icon, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import {
  LuCode,
  LuSettings2,
  LuSquareFunction,
  LuTag,
  LuWrench,
} from "react-icons/lu";

export type Suggestion = {
  type: "keyword" | "function" | "variable" | "param" | "controllerParam";
  value: string;
  fromPosition: number;
  toPosition?: number;
};

const SUGGESTION_PRIORITY: Partial<Record<Suggestion["type"], number>> = {
  keyword: 0,
  function: 1,
  param: 2,
  controllerParam: 3,
  variable: 4,
};

export const compareSuggestions = (a: Suggestion, b: Suggestion): number => {
  const pa = SUGGESTION_PRIORITY[a.type] ?? 99;
  const pb = SUGGESTION_PRIORITY[b.type] ?? 99;
  return pa - pb;
};

export type AutoCompleterProps = {
  suggestions: Suggestion[];
  hoveredItem?: number;
};

type SuggestionMeta = {
  icon: React.ElementType;
  colorPalette: string;
  label: string;
};

const SUGGESTION_META: Record<Suggestion["type"], SuggestionMeta> = {
  keyword: { icon: LuCode, colorPalette: "purple", label: "keyword" },
  function: { icon: LuSquareFunction, colorPalette: "blue", label: "fn" },
  variable: { icon: LuTag, colorPalette: "green", label: "field" },
  param: { icon: LuSettings2, colorPalette: "orange", label: "param" },
  controllerParam: { icon: LuWrench, colorPalette: "orange", label: "param" },
};

export const AutoCompleter = ({
  suggestions,
  hoveredItem,
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
      <Box ref={scrollerRef} p="1" overflow="auto" maxH="140px">
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
                {suggestion.value}
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
