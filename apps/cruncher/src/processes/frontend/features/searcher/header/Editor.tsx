import type { QQLParserErrorDetail, SuggestionData } from "@cruncher/qql";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { ReactNode, useEffect, useMemo } from "react";
import { Suggestion } from "~components/ui/editor/AutoCompleter";
import { Editor as EditorComponent } from "~components/ui/editor/Editor";
import { HighlightData } from "~components/ui/editor/Highlighter";
import { SUPPORTED_AGG_FUNCTIONS } from "~lib/pipelineEngine/aggregateData";
import {
  isBooleanFunction,
  SUPPORTED_BOOLEAN_FUNCTIONS,
} from "~lib/pipelineEngine/logicalExpression";
import { HighlightData as ParserHighlightData } from "@cruncher/qql/grammar";
import { getPopperRoot } from "~core/utils/shadowUtils";
import { availableColumnsAtom, queryDataAtom } from "~core/store/queryState";
import {
  dynamicSuggestionsCacheAtom,
  selectedSearchProfileAtom,
  useControllerParams,
  useInitializedController,
} from "~core/search";
import { notifySuccess } from "../../../core/notifyError";
import styled from "@emotion/styled";
import { token } from "~components/ui/system";

const EditorErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${token("spacing.2")};
  padding: ${token("spacing.2")} ${token("spacing.3")};
  border-radius: ${token("radii.md")};
  border: 1px solid ${token("colors.border")};
  background-color: ${token("colors.bg.muted")};
  color: ${token("colors.fg.muted")};
  font-size: 0.8rem;
  flex: 1;
  min-width: 0;
`;

const EditorErrorReset = styled.button`
  flex-shrink: 0;
  padding: ${token("spacing.1")} ${token("spacing.2")};
  border-radius: ${token("radii.md")};
  border: 1px solid ${token("colors.border")};
  background: transparent;
  color: ${token("colors.fg.muted")};
  font-size: 0.75rem;
  cursor: pointer;
  &:hover {
    background-color: ${token("colors.bg")};
  }
`;

export class EditorErrorBoundary extends React.Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Editor error:", error);
  }

  render() {
    if (this.state.error) {
      const stack = this.state.error.stack ?? this.state.error.message;
      return (
        <EditorErrorBox>
          <span
            title={this.state.error.message}
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Editor error: {this.state.error.message}
          </span>
          <EditorErrorReset
            onClick={() => navigator.clipboard.writeText(stack)}
          >
            Copy
          </EditorErrorReset>
          <EditorErrorReset onClick={() => this.setState({ error: null })}>
            Reset
          </EditorErrorReset>
        </EditorErrorBox>
      );
    }
    return this.props.children;
  }
}

export const queryEditorAtom = atom<HTMLTextAreaElement | null>(null);

export type EditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const translateHighlightData = (
  value: string,
  parserHighlightData: ParserHighlightData,
): HighlightData => {
  const { startOffset, endOffset } = parserHighlightData.token;
  // get word
  const word = value.slice(startOffset, (endOffset ?? startOffset) + 1);
  if (isBooleanFunction(word)) {
    return {
      type: "booleanFunction",
      token: {
        startOffset,
        endOffset,
      },
    };
  }
  return parserHighlightData;
};

export const Editor = ({ value, onChange }: EditorProps) => {
  const availableColumns = useAtomValue(availableColumnsAtom);
  const data = useAtomValue(queryDataAtom);

  const handleCopyAst = async () => {
    const json = JSON.stringify(data.ast, null, 2);
    await navigator.clipboard.writeText(json);
    notifySuccess("AST copied to clipboard");
  };
  const setQueryEditor = useSetAtom(queryEditorAtom);
  const controllerParamsResp = useControllerParams();
  const controllerParams = useMemo(() => {
    if (controllerParamsResp.state !== "hasData") {
      return {};
    }

    return controllerParamsResp.data;
  }, [controllerParamsResp]);

  const controller = useInitializedController();
  const selectedProfile = useAtomValue(selectedSearchProfileAtom);
  const [dynamicCache, setDynamicCache] = useAtom(dynamicSuggestionsCacheAtom);

  // Stable cache key: changes only when profile name or index list changes
  const currentCacheKey = useMemo(
    () =>
      JSON.stringify({
        profile: selectedProfile?.name,
        indexes: [...(controllerParams.index ?? [])].sort(),
      }),
    [selectedProfile?.name, controllerParams.index],
  );

  // Treat values from a different cacheKey as stale (don't show them).
  // null entries are in-flight — show empty until resolved.
  const dynamicValues: Record<string, string[]> =
    dynamicCache.cacheKey === currentCacheKey
      ? Object.fromEntries(
          Object.entries(dynamicCache.values).flatMap(([k, v]) =>
            v !== null ? [[k, v]] : [],
          ),
        )
      : {};

  // Stable string dep so the effect doesn't re-run on every keystroke
  const paramValueKeysStr = useMemo(
    () =>
      JSON.stringify(
        (data.suggestions ?? [])
          .filter((s) => s.type === "paramValue")
          .map(
            (s) => (s as Extract<SuggestionData, { type: "paramValue" }>).key,
          ),
      ),
    [data.suggestions],
  );

  useEffect(() => {
    if (!selectedProfile) return;
    const keys: string[] = JSON.parse(paramValueKeysStr);
    const currentValues =
      dynamicCache.cacheKey === currentCacheKey ? dynamicCache.values : {};
    const uncachedKeys = keys.filter((k) => !(k in currentValues));
    if (uncachedKeys.length === 0) return;

    // Mark uncached keys as in-flight atomically BEFORE firing fetches
    setDynamicCache((prev) => {
      const base = prev.cacheKey === currentCacheKey ? prev.values : {};
      const pending = Object.fromEntries(uncachedKeys.map((k) => [k, null]));
      return { cacheKey: currentCacheKey, values: { ...base, ...pending } };
    });

    const indexes = controllerParams.index ?? [];
    uncachedKeys.forEach((field) => {
      Promise.all(
        selectedProfile.instances.map((instance) =>
          controller
            .getParamValueSuggestions(instance, field, indexes)
            .catch(() => [] as string[]),
        ),
      ).then((results) => {
        const merged = [...new Set(results.flat())];
        setDynamicCache((prev) => {
          if (prev.cacheKey !== currentCacheKey) return prev;
          return { cacheKey: currentCacheKey, values: { ...prev.values, [field]: merged } };
        });
      });
    });
  }, [paramValueKeysStr, currentCacheKey, selectedProfile, controller]);

  // Get the controller params from the context
  const highlightData = useMemo<HighlightData[]>(() => {
    const errorHighlightData = (data.parserError ?? []).map(
      (error: QQLParserErrorDetail) => {
        return {
          type: "error",
          metadata: error.message,
          token: {
            startOffset: error.token.startOffset,
            endOffset: error.token.endOffset,
          },
        };
      },
    );

    const processedHighlightData = data.highlight.map((highlight) =>
      translateHighlightData(value, highlight),
    );

    return [...errorHighlightData, ...processedHighlightData];
  }, [value, data]);

  const suggestions = useMemo(() => {
    const results: Suggestion[] = [];
    for (const suggestion of data.suggestions ?? []) {
      switch (suggestion.type) {
        case "params":
          results.push(
            ...suggestion.keywords.map(
              (keyword) =>
                ({
                  type: "param",
                  value: keyword,
                  fromPosition: suggestion.fromPosition,
                  toPosition: suggestion.toPosition,
                }) satisfies Suggestion,
            ),
          );
          break;
        case "keywords":
          results.push(
            ...suggestion.keywords.map(
              (keyword) =>
                ({
                  type: "keyword",
                  value: keyword,
                  fromPosition: suggestion.fromPosition,
                  toPosition: suggestion.toPosition,
                }) satisfies Suggestion,
            ),
          );
          break;
        case "column":
          availableColumns.forEach((column) =>
            results.push({
              type: "variable",
              value: column,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        case "function":
          SUPPORTED_AGG_FUNCTIONS.forEach((func) =>
            results.push({
              type: "function",
              value: func,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        case "booleanFunction":
          SUPPORTED_BOOLEAN_FUNCTIONS.forEach((func) =>
            results.push({
              type: "function",
              value: func,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        case "controllerParam": {
          const excluded = new Set(suggestion.excludeKeys ?? []);
          Object.keys(controllerParams)
            .filter((param) => !excluded.has(param))
            .forEach((param) =>
              results.push({
                type: "controllerParam",
                value: param,
                fromPosition: suggestion.fromPosition,
                toPosition: suggestion.toPosition,
              }),
            );
          break;
        }
        case "paramValue": {
          const staticVals = controllerParams[suggestion.key] ?? [];
          const dynamicVals = dynamicValues[suggestion.key] ?? [];
          const merged = [...new Set([...staticVals, ...dynamicVals])];
          merged.forEach((value) =>
            results.push({
              type: "variable",
              value: `"${value}"`,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        }
      }
    }
    return results;
  }, [data, dynamicValues, controllerParams]);

  const popperRoot = getPopperRoot();

  return (
    <EditorErrorBoundary>
      <EditorComponent
        popperRoot={popperRoot}
        ref={setQueryEditor}
        value={value}
        onChange={onChange}
        highlightData={highlightData}
        suggestions={suggestions}
        onCopyAst={handleCopyAst}
      />
    </EditorErrorBoundary>
  );
};
